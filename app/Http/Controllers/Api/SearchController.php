<?php

namespace App\Http\Controllers\Api;

use App\Models\Consumer;
use App\Models\WaterConsumption;
use App\Models\Report;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $results = [];

        // Search Consumers
        $consumers = Consumer::where('name', 'like', "%{$query}%")
            ->orWhere('account_number', 'like', "%{$query}%")
            ->orWhere('meter_number', 'like', "%{$query}%")
            ->orWhere('custcode', 'like', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($consumers as $consumer) {
            $results[] = [
                'type' => 'consumer',
                'id' => $consumer->id,
                'title' => $consumer->name,
                'subtitle' => "Account: {$consumer->account_number} | Meter: {$consumer->meter_number}",
                'link' => "/consumers/{$consumer->custcode}",
                'icon' => 'Users',
            ];
        }

        // Search Water Consumptions
        $consumptions = WaterConsumption::with('consumer')
            ->whereHas('consumer', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('account_number', 'like', "%{$query}%");
            })
            ->orWhere('current_reading', 'like', "%{$query}%")
            ->orWhere('previous_reading', 'like', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($consumptions as $consumption) {
            $results[] = [
                'type' => 'consumption',
                'id' => $consumption->id,
                'title' => "{$consumption->consumer->name} - {$consumption->consumption} m³",
                'subtitle' => "Period: {$consumption->start_date} to {$consumption->end_date}",
                'link' => "/water-consumptions/{$consumption->id}",
                'icon' => 'DropletIcon',
            ];
        }

        // Search Reports
        $reports = Report::with('consumer')
            ->whereHas('consumer', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orWhere('content', 'like', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($reports as $report) {
            $results[] = [
                'type' => 'report',
                'id' => $report->id,
                'title' => "Report from {$report->consumer->name}",
                'subtitle' => substr($report->content, 0, 50) . '...',
                'link' => "/reports/{$report->id}",
                'icon' => 'FileText',
            ];
        }

        return response()->json(['results' => $results]);
    }
}
