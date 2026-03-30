<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\WaterConsumption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ConsumerWaterConsumptionController extends Controller
{
    /**
     * Get all water consumption records for authenticated consumer
     */
    public function index(Request $request)
    {
        try {
            Log::info('=== WATER CONSUMPTION INDEX START ===');

            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $consumer = Auth::user();
            Log::info('Authenticated consumer: ' . $consumer->custcode);

            $query = WaterConsumption::with(['reports'])
                ->where('custcode', $consumer->custcode)
                ->orderBy('end_date', 'desc')
                ->orderBy('created_at', 'desc');

            $consumptions = $query->paginate($request->get('per_page', 15));

            Log::info('Found ' . $consumptions->count() . ' consumption records');

            $formattedConsumptions = $consumptions->map(function ($consumption) {
                return [
                    'id' => $consumption->id,
                    'custcode' => $consumption->custcode,
                    'current_reading' => $consumption->current_reading,
                    'previous_reading' => $consumption->previous_reading,
                    'consumption' => (float) $consumption->consumption,
                    'start_date' => $consumption->start_date ? $consumption->start_date->format('Y-m-d') : null,
                    'end_date' => $consumption->end_date ? $consumption->end_date->format('Y-m-d') : null,
                    'billing_period' => $this->getBillingPeriod($consumption),
                    'reports_count' => $consumption->reports->count(),
                    'reports' => [],
                ];
            });

            Log::info('Successfully formatted ' . $formattedConsumptions->count() . ' records');
            Log::info('=== WATER CONSUMPTION INDEX END ===');

            return response()->json([
                'success' => true,
                'data' => [
                    'consumptions' => $formattedConsumptions,
                    'summary' => [
                        'total_consumption' => (float) $query->sum('consumption'),
                        'average_consumption' => round((float) $query->avg('consumption'), 2),
                        'total_records' => $query->count(),
                        'latest_reading_date' => $query->first() ? $query->first()->end_date?->format('Y-m-d') : null,
                    ],
                    'pagination' => [
                        'current_page' => $consumptions->currentPage(),
                        'last_page' => $consumptions->lastPage(),
                        'per_page' => $consumptions->perPage(),
                        'total' => $consumptions->total()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in water consumption index: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch water consumption records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific water consumption record
     */
    public function show($id)
    {
        try {
            Log::info('=== WATER CONSUMPTION SHOW START ===');
            Log::info('Fetching consumption with ID: ' . $id);

            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $consumer = Auth::user();

            $consumption = WaterConsumption::with(['reports', 'consumer'])
                ->where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$consumption) {
                Log::warning('Consumption record not found for ID: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Water consumption record not found'
                ], 404);
            }

            Log::info('Found consumption record');
            Log::info('=== WATER CONSUMPTION SHOW END ===');

            return response()->json([
                'success' => true,
                'data' => [
                    'consumption' => $this->formatWaterConsumption($consumption, true)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in water consumption show: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch water consumption record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get consumption statistics for charts and analytics
     */
    public function getStatistics(Request $request)
    {
        try {
            Log::info('=== GET STATISTICS START ===');

            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $consumer = Auth::user();
            $year = $request->get('year', now()->year);

            Log::info('Getting statistics for consumer: ' . $consumer->custcode . ', year: ' . $year);

            $monthlyConsumption = [];
            for ($month = 1; $month <= 12; $month++) {
                $consumption = WaterConsumption::where('custcode', $consumer->custcode)
                    ->whereYear('end_date', $year)
                    ->whereMonth('end_date', $month)
                    ->sum('consumption');

                $hasReports = WaterConsumption::where('custcode', $consumer->custcode)
                    ->whereYear('end_date', $year)
                    ->whereMonth('end_date', $month)
                    ->has('reports')
                    ->exists();

                $monthlyConsumption[] = [
                    'month' => date('F', mktime(0, 0, 0, $month, 1)),
                    'month_number' => $month,
                    'month_short' => date('M', mktime(0, 0, 0, $month, 1)),
                    'consumption' => (float) $consumption,
                    'formatted_consumption' => $consumption . ' m³',
                    'has_reports' => $hasReports,
                ];
            }

            $averageConsumption = WaterConsumption::where('custcode', $consumer->custcode)
                ->whereYear('end_date', $year)
                ->avg('consumption');

            $totalConsumption = collect($monthlyConsumption)->sum('consumption');

            Log::info('Statistics calculated successfully');
            Log::info('=== GET STATISTICS END ===');

            return response()->json([
                'success' => true,
                'data' => [
                    'year' => $year,
                    'summary' => [
                        'total_consumption' => $totalConsumption,
                        'formatted_total' => $totalConsumption . ' m³',
                        'average_monthly' => round($averageConsumption, 2),
                        'formatted_average' => round($averageConsumption, 2) . ' m³',
                        'months_with_reports' => collect($monthlyConsumption)->where('has_reports', true)->count(),
                    ],
                    'monthly_breakdown' => $monthlyConsumption,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getStatistics: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch consumption statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get consumption trends for the last 6 months
     */
    public function getTrends()
    {
        try {
            Log::info('=== GET TRENDS START ===');

            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $consumer = Auth::user();
            Log::info('Getting trends for consumer: ' . $consumer->custcode);

            $trends = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $consumption = WaterConsumption::where('custcode', $consumer->custcode)
                    ->whereMonth('end_date', $date->month)
                    ->whereYear('end_date', $date->year)
                    ->sum('consumption');

                $trends[] = [
                    'month' => $date->format('M Y'),
                    'month_number' => $date->month,
                    'year' => $date->year,
                    'consumption' => (float) $consumption,
                    'formatted_consumption' => $consumption . ' m³',
                    'reports_count' => 0,
                ];
            }

            Log::info('Trends generated: ' . count($trends) . ' months');
            Log::info('=== GET TRENDS END ===');

            return response()->json([
                'success' => true,
                'data' => [
                    'trends' => $trends,
                    'summary' => [
                        'total_last_6_months' => (float) collect($trends)->sum('consumption'),
                        'average_monthly' => round((float) collect($trends)->avg('consumption'), 2),
                        'highest_month' => collect($trends)->sortByDesc('consumption')->first(),
                        'lowest_month' => collect($trends)->sortBy('consumption')->first(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getTrends: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch consumption trends',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to get billing period
     */
    private function getBillingPeriod($consumption)
    {
        if ($consumption->start_date && $consumption->end_date) {
            return $consumption->start_date->format('M d') . ' - ' . $consumption->end_date->format('M d, Y');
        }
        return 'N/A';
    }

    /**
     * Format water consumption data for API response
     */
    private function formatWaterConsumption($consumption, $includeReports = false)
    {
        $data = [
            'id' => $consumption->id,
            'custcode' => $consumption->custcode,
            'current_reading' => $consumption->current_reading,
            'previous_reading' => $consumption->previous_reading,
            'consumption' => (float) $consumption->consumption,
            'formatted_consumption' => $consumption->consumption . ' m³',
            'start_date' => $consumption->start_date ? $consumption->start_date->format('Y-m-d') : null,
            'end_date' => $consumption->end_date ? $consumption->end_date->format('Y-m-d') : null,
            'billing_period' => $this->getBillingPeriod($consumption),
            'created_at' => $consumption->created_at->toISOString(),
            'updated_at' => $consumption->updated_at->toISOString(),
        ];

        if ($includeReports && $consumption->relationLoaded('reports')) {
            $data['reports'] = $consumption->reports->map(function ($report) {
                return [
                    'id' => $report->id,
                    'image_url' => $report->image ? asset('storage/' . $report->image) : null,
                    'content' => $report->content,
                    'created_at' => $report->created_at->toISOString()
                ];
            });
            $data['reports_count'] = $consumption->reports->count();
        }

        return $data;
    }
}
