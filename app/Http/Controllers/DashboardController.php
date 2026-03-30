<?php
// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Consumer;
use App\Models\WaterConsumption;
use App\Models\PublicAdvisory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $consumers = Consumer::count();

        // Get current year
        $currentYear = Carbon::now()->year;

        // Get total water consumption for current year
        $totalConsumption = WaterConsumption::whereYear('start_date', $currentYear)
            ->sum('consumption');

        // Get monthly consumption data for the chart
        $monthlyConsumption = WaterConsumption::whereYear('start_date', $currentYear)
            ->selectRaw('MONTH(start_date) as month, SUM(consumption) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Prepare monthly data array (January to December)
        $monthlyData = array_fill(1, 12, 0);
        foreach ($monthlyConsumption as $data) {
            $monthlyData[$data->month] = round($data->total, 2);
        }

        // Get consumption by connection type
        $consumptionByType = WaterConsumption::whereYear('start_date', $currentYear)
            ->join('consumers', 'water_consumptions.custcode', '=', 'consumers.custcode')
            ->selectRaw('consumers.connection_type, SUM(water_consumptions.consumption) as total')
            ->groupBy('consumers.connection_type')
            ->get();

        $typeData = [
            'residential' => 0,
            'commercial' => 0,
            'institutional' => 0,
        ];
        foreach ($consumptionByType as $data) {
            $typeData[$data->connection_type] = round($data->total, 2);
        }

        // Get recent water consumption records (last 5)
        $recentConsumptions = WaterConsumption::with('consumer')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'consumer_name' => $record->consumer->name,
                    'consumer_code' => $record->consumer->custcode,
                    'consumption' => $record->consumption,
                    'start_date' => $record->start_date,
                    'end_date' => $record->end_date,
                    'meter_number' => $record->consumer->meter_number,
                    'formatted_period' => Carbon::parse($record->start_date)->format('M j') . ' → ' . Carbon::parse($record->end_date)->format('M j'),
                ];
            });

        // Get previous year's data for comparison
        $previousYear = $currentYear - 1;
        $previousYearConsumption = WaterConsumption::whereYear('start_date', $previousYear)
            ->sum('consumption');

        // Calculate percentage change
        $percentageChange = 0;
        if ($previousYearConsumption > 0) {
            $percentageChange = round((($totalConsumption - $previousYearConsumption) / $previousYearConsumption) * 100, 1);
        }

        // Get recent public advisories (last 5)
        $publicAdvisories = PublicAdvisory::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($advisory) {
                return [
                    'id' => $advisory->id,
                    'title' => $advisory->title,
                    'description' => $advisory->description,
                    'type' => $advisory->type,
                    'status' => $advisory->status,
                    'affected_areas' => $advisory->affected_areas,
                    'scheduled_date' => $advisory->scheduled_date,
                    'created_at' => $advisory->created_at,
                    'formatted_date' => $advisory->formatted_date,
                    'type_color' => $advisory->type_color,
                    'status_color' => $advisory->status_color,
                ];
            });

        // Log what we're sending
        Log::info('DashboardController: Sending data', [
            'consumers_count' => $consumers,
            'total_consumption' => $totalConsumption,
            'monthly_data' => $monthlyData,
            'advisories_count' => $publicAdvisories->count(),
            'recent_consumptions_count' => $recentConsumptions->count(),
        ]);

        return Inertia::render('Dashboard/Index', [
            'consumers' => $consumers,
            'publicAdvisories' => $publicAdvisories,
            'totalConsumption' => $totalConsumption,
            'monthlyData' => array_values($monthlyData), // Convert to indexed array for easier use in JS
            'typeData' => $typeData,
            'recentConsumptions' => $recentConsumptions,
            'percentageChange' => $percentageChange,
            'currentYear' => $currentYear,
        ]);
    }
}
