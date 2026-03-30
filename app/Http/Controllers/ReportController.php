<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\MultimodalAiResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display a listing of all reports with AI analysis
     */
    public function index(Request $request)
    {
        $query = Report::with(['consumer', 'waterConsumption', 'aiResponse']);

        // Filter by leak detected
        if ($request->filled('leak_detected')) {
            $leakDetected = filter_var($request->leak_detected, FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('aiResponse', function ($q) use ($leakDetected) {
                $q->where('leak_detected', $leakDetected);
            });
        }

        // Filter by severity
        if ($request->filled('severity')) {
            $query->whereHas('aiResponse', function ($q) use ($request) {
                $q->where('severity', $request->severity);
            });
        }

        $reports = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15))
            ->through(function ($report) {
                return [
                    'id' => $report->id,
                    'custcode' => $report->custcode,
                    'content' => $report->content,
                    'image' => $report->image ? asset('storage/' . $report->image) : null,
                    'created_at' => $report->created_at,
                    'updated_at' => $report->updated_at,
                    'consumer' => $report->consumer ? [
                        'name' => $report->consumer->name,
                        'account_number' => $report->consumer->account_number,
                        'meter_number' => $report->consumer->meter_number,
                    ] : null,
                    'water_consumption' => $report->waterConsumption ? [
                        'id' => $report->waterConsumption->id,
                        'consumption' => $report->waterConsumption->consumption,
                        'formatted_consumption' => $report->waterConsumption->consumption . ' m³',
                        'billing_period' => $report->waterConsumption->billing_period,
                        'start_date' => $report->waterConsumption->start_date,
                        'end_date' => $report->waterConsumption->end_date,
                    ] : null,
                    'ai_response' => $report->aiResponse ? [
                        'id' => $report->aiResponse->id,
                        'leak_detected' => $report->aiResponse->leak_detected,
                        'leak_type' => $report->aiResponse->leak_type,
                        'severity' => $report->aiResponse->severity,
                        'priority' => $report->aiResponse->priority,
                        'image_analysis' => $report->aiResponse->image_analysis,
                        'recommendation' => $report->aiResponse->recommendation,
                        'summary' => $report->aiResponse->summary,
                        'text_consistency' => $report->aiResponse->text_consistency,
                        'consumption_analysis' => $report->aiResponse->consumption_analysis,
                        'trend_analysis' => $report->aiResponse->trend_analysis,
                        'analyzed_at' => $report->aiResponse->analyzed_at,
                    ] : null,
                ];
            });

        return Inertia::render('Report/Index', [
            'reports' => $reports,
            'filters' => [
                'leak_detected' => $request->leak_detected ?? '',
                'severity' => $request->severity ?? '',
            ],
        ]);
    }

    /**
     * Display a specific report with its AI analysis
     */
    public function show($id)
    {
        $report = Report::with(['consumer', 'waterConsumption', 'aiResponse'])
            ->findOrFail($id);

        $formattedReport = [
            'id' => $report->id,
            'custcode' => $report->custcode,
            'content' => $report->content,
            'image' => $report->image ? asset('storage/' . $report->image) : null,
            'created_at' => $report->created_at,
            'updated_at' => $report->updated_at,
            'consumer' => $report->consumer ? [
                'name' => $report->consumer->name,
                'account_number' => $report->consumer->account_number,
                'meter_number' => $report->consumer->meter_number,
                'address' => $report->consumer->address,
                'mobile_number' => $report->consumer->mobile_number,
            ] : null,
            'water_consumption' => $report->waterConsumption ? [
                'id' => $report->waterConsumption->id,
                'consumption' => $report->waterConsumption->consumption,
                'formatted_consumption' => $report->waterConsumption->consumption . ' m³',
                'current_reading' => $report->waterConsumption->current_reading,
                'previous_reading' => $report->waterConsumption->previous_reading,
                'billing_period' => $report->waterConsumption->billing_period,
                'start_date' => $report->waterConsumption->start_date,
                'end_date' => $report->waterConsumption->end_date,
            ] : null,
            'ai_response' => $report->aiResponse ? [
                'id' => $report->aiResponse->id,
                'leak_detected' => $report->aiResponse->leak_detected,
                'leak_type' => $report->aiResponse->leak_type,
                'severity' => $report->aiResponse->severity,
                'priority' => $report->aiResponse->priority,
                'image_analysis' => $report->aiResponse->image_analysis,
                'recommendation' => $report->aiResponse->recommendation,
                'summary' => $report->aiResponse->summary,
                'text_consistency' => $report->aiResponse->text_consistency,
                'consumption_analysis' => $report->aiResponse->consumption_analysis,
                'trend_analysis' => $report->aiResponse->trend_analysis,
                'raw_response' => $report->aiResponse->raw_response,
                'analyzed_at' => $report->aiResponse->analyzed_at,
                'is_cached' => $report->aiResponse->is_cached,
            ] : null,
        ];

        return Inertia::render('Report/Show', [
            'report' => $formattedReport,
        ]);
    }

    /**
     * Get AI analysis for a report (API endpoint)
     */
    public function getAnalysis($id)
    {
        $report = Report::with('aiResponse')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'report' => $report,
                'ai_analysis' => $report->aiResponse
            ]
        ]);
    }

    /**
     * Get all reports with AI analysis (API endpoint)
     */
    public function getReportsWithAnalysis(Request $request)
    {
        $reports = Report::with(['consumer', 'waterConsumption', 'aiResponse'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Filter reports by AI analysis results
     */
    public function filterByAnalysis(Request $request)
    {
        $query = Report::with(['consumer', 'waterConsumption', 'aiResponse']);

        // Filter by leak detection
        if ($request->has('leak_detected') && $request->leak_detected !== '') {
            $leakDetected = filter_var($request->leak_detected, FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('aiResponse', function ($q) use ($leakDetected) {
                $q->where('leak_detected', $leakDetected);
            });
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity !== '') {
            $query->whereHas('aiResponse', function ($q) use ($request) {
                $q->where('severity', $request->severity);
            });
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $reports = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15))
            ->through(function ($report) {
                return [
                    'id' => $report->id,
                    'custcode' => $report->custcode,
                    'content' => $report->content,
                    'image' => $report->image ? asset('storage/' . $report->image) : null,
                    'created_at' => $report->created_at,
                    'consumer' => $report->consumer ? [
                        'name' => $report->consumer->name,
                        'account_number' => $report->consumer->account_number,
                    ] : null,
                    'water_consumption' => $report->waterConsumption ? [
                        'consumption' => $report->waterConsumption->consumption,
                        'billing_period' => $report->waterConsumption->billing_period,
                    ] : null,
                    'ai_response' => $report->aiResponse ? [
                        'leak_detected' => $report->aiResponse->leak_detected,
                        'severity' => $report->aiResponse->severity,
                        'priority' => $report->aiResponse->priority,
                        'summary' => $report->aiResponse->summary,
                    ] : null,
                ];
            });

        return Inertia::render('Report/Index', [
            'reports' => $reports,
            'filters' => $request->all(),
        ]);
    }
}
