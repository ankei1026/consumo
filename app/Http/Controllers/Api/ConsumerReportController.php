<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\Report;
use App\Models\WaterConsumption;
use App\Models\MultimodalAiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Notifications\ConsumerReportNotification;
use Illuminate\Support\Facades\Notification;

class ConsumerReportController extends Controller
{
    /**
     * Create a new report for water consumption with AI analysis
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'water_consumption_id' => 'required|exists:water_consumptions,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'content' => 'required|string|min:10|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $consumer = Auth::user();

            // Verify that the water consumption belongs to this consumer
            $waterConsumption = WaterConsumption::where('id', $request->water_consumption_id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$waterConsumption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Water consumption record not found or does not belong to you'
                ], 404);
            }

            // Store image
            $imagePath = $request->file('image')->store('reports', 'public');
            $fullImagePath = Storage::disk('public')->path($imagePath);

            // Create report
            $report = Report::create([
                'custcode' => $consumer->custcode,
                'image' => $imagePath,
                'content' => $request->content,
                'water_consumption_id' => $request->water_consumption_id,
                'status' => 'pending'
            ]);

            // Get historical consumption data for AI analysis
            $consumptionRecords = $this->getHistoricalConsumptionData($consumer->custcode, $waterConsumption->id);

            // Prepare data for AI analysis
            $aiData = [
                'report_content' => $request->content,
                'consumption_records' => $consumptionRecords,
                'water_consumption_id' => $waterConsumption->id
            ];

            // Call AI service asynchronously
            $this->analyzeReportWithAI($report, $fullImagePath, $aiData);

            $admins = User::where('role', 'admin')->get();

            // Send notification
            Notification::send($admins, new ConsumerReportNotification($report));

            return response()->json([
                'success' => true,
                'message' => 'Report submitted successfully. AI analysis is being processed.',
                'data' => [
                    'report' => $this->formatReport($report)
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to submit report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get historical consumption data for AI analysis
     *
     * @param string $custcode
     * @param int $currentConsumptionId
     * @return array
     */
    private function getHistoricalConsumptionData($custcode, $currentConsumptionId)
    {
        try {
            // Get current consumption record
            $currentConsumption = WaterConsumption::find($currentConsumptionId);

            // Get historical records (last 6 months excluding current)
            // Using start_date instead of reading_date
            $historicalRecords = WaterConsumption::where('custcode', $custcode)
                ->where('id', '!=', $currentConsumptionId)
                ->orderBy('start_date', 'desc')
                ->limit(6)
                ->get();

            $consumptionRecords = [];

            // Add current consumption record
            $consumptionRecords[] = [
                'id' => $currentConsumption->id,
                'consumption' => $currentConsumption->consumption,
                'current_reading' => $currentConsumption->current_reading,
                'previous_reading' => $currentConsumption->previous_reading,
                'start_date' => $currentConsumption->start_date ? $currentConsumption->start_date->format('Y-m-d') : null,
                'end_date' => $currentConsumption->end_date ? $currentConsumption->end_date->format('Y-m-d') : null,
            ];

            // Add historical records
            foreach ($historicalRecords as $record) {
                $consumptionRecords[] = [
                    'id' => $record->id,
                    'consumption' => $record->consumption,
                    'current_reading' => $record->current_reading,
                    'previous_reading' => $record->previous_reading,
                    'start_date' => $record->start_date ? $record->start_date->format('Y-m-d') : null,
                    'end_date' => $record->end_date ? $record->end_date->format('Y-m-d') : null,
                ];
            }

            return $consumptionRecords;
        } catch (\Exception $e) {
            Log::error('Failed to get historical consumption data: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Analyze report with AI service
     *
     * @param Report $report
     * @param string $imagePath
     * @param array $aiData
     * @return void
     */
    private function analyzeReportWithAI($report, $imagePath, $aiData)
    {
        try {
            // Get AI API URL from envs
            $aiApiUrl = env('PYTHON_AI_API_URL', 'http://127.0.0.1:5001');

            // Check if AI service is available
            $healthCheck = Http::timeout(5)->get($aiApiUrl . '/health');
            if (!$healthCheck->successful()) {
                Log::warning('AI service is not available');
                return;
            }

            // Prepare billing data
            $billingData = [
                'report_content' => $aiData['report_content'],
                'consumption_records' => $aiData['consumption_records']
            ];

            // Create multipart form data request
            $response = Http::timeout(60)
                ->attach(
                    'image',
                    file_get_contents($imagePath),
                    basename($imagePath)
                )
                ->post($aiApiUrl . '/analyze-leak', [
                    'billing_data' => json_encode($billingData)
                ]);

            if ($response->successful()) {
                $aiResult = $response->json();

                if (isset($aiResult['success']) && $aiResult['success'] && isset($aiResult['data'])) {
                    // Store AI analysis result
                    $this->storeAiResponse($report, $aiResult['data']);

                    Log::info('AI analysis completed for report: ' . $report->id);
                } else {
                    Log::warning('AI analysis returned error for report ' . $report->id . ': ' . json_encode($aiResult));
                }
            } else {
                Log::error('AI service request failed for report ' . $report->id . ': ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('AI analysis failed for report ' . $report->id . ': ' . $e->getMessage());
        }
    }

    /**
     * Store AI response in database
     *
     * @param Report $report
     * @param array $analysisData
     * @return void
     */
    private function storeAiResponse($report, $analysisData)
    {
        try {
            MultimodalAiResponse::updateOrCreate(
                ['report_id' => $report->id],
                [
                    'leak_detected' => $analysisData['leak_detected'] ?? false,
                    'leak_type' => $analysisData['leak_type'] ?? null,
                    'severity' => $analysisData['severity'] ?? null,
                    'priority' => $analysisData['priority'] ?? null,
                    'image_analysis' => $analysisData['image_analysis'] ?? null,
                    'recommendation' => $analysisData['recommendation'] ?? null,
                    'summary' => $analysisData['summary'] ?? null,
                    'text_consistency' => $analysisData['text_consistency'] ?? null,
                    'consumption_analysis' => $analysisData['consumption_analysis'] ?? null,
                    'trend_analysis' => $analysisData['trend_analysis'] ?? null,
                    'raw_response' => $analysisData,
                    'analyzed_at' => now(),
                    'is_cached' => false
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store AI response: ' . $e->getMessage());
        }
    }

    /**
     * Get AI analysis for a specific report
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReportAnalysis($id)
    {
        try {
            $consumer = Auth::user();

            $report = Report::where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->with(['aiResponse', 'waterConsumption'])
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'report' => $this->formatReport($report),
                    'ai_analysis' => $report->aiResponse ? [
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
                        'analyzed_at' => $report->aiResponse->analyzed_at ? $report->aiResponse->analyzed_at->toISOString() : null,
                        'is_cached' => $report->aiResponse->is_cached
                    ] : null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch report analysis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch report analysis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all reports for authenticated consumer
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReports(Request $request)
    {
        try {
            $consumer = Auth::user();

            $reports = Report::with(['waterConsumption', 'consumer', 'aiResponse'])
                ->where('custcode', $consumer->custcode)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => [
                    'reports' => $reports->through(function ($report) {
                        return $this->formatReport($report);
                    }),
                    'pagination' => [
                        'current_page' => $reports->currentPage(),
                        'last_page' => $reports->lastPage(),
                        'per_page' => $reports->perPage(),
                        'total' => $reports->total()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch reports: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific report
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showReport($id)
    {
        try {
            $consumer = Auth::user();

            $report = Report::with(['waterConsumption', 'consumer', 'aiResponse'])
                ->where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'report' => $this->formatReport($report)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get water consumption history
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWaterConsumptionHistory(Request $request)
    {
        try {
            $consumer = Auth::user();

            $query = WaterConsumption::with(['reports'])
                ->where('custcode', $consumer->custcode)
                ->orderBy('start_date', 'desc')
                ->orderBy('created_at', 'desc');

            // Optional filters - using start_date
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
            }

            if ($request->has('year')) {
                $query->whereYear('start_date', $request->year);
            }

            $consumptions = $query->paginate($request->get('per_page', 15));

            // Calculate summary statistics
            $totalConsumption = WaterConsumption::where('custcode', $consumer->custcode)->sum('consumption');
            $avgConsumption = WaterConsumption::where('custcode', $consumer->custcode)->avg('consumption');
            $totalReports = Report::where('custcode', $consumer->custcode)->count();
            $latestReading = WaterConsumption::where('custcode', $consumer->custcode)
                ->orderBy('start_date', 'desc')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'consumptions' => $consumptions->through(function ($consumption) {
                        return $this->formatWaterConsumption($consumption);
                    }),
                    'summary' => [
                        'total_consumption' => $totalConsumption,
                        'average_consumption' => round($avgConsumption, 2),
                        'total_reports' => $totalReports,
                        'latest_reading_date' => $latestReading ? $latestReading->start_date->format('Y-m-d') : null
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
            Log::error('Failed to fetch consumption history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch consumption history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific water consumption with its reports
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function showWaterConsumption($id)
    {
        try {
            $consumer = Auth::user();

            $consumption = WaterConsumption::with(['reports', 'consumer'])
                ->where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$consumption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Water consumption record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'consumption' => $this->formatWaterConsumption($consumption)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch water consumption: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch water consumption',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics for consumer
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard()
    {
        try {
            $consumer = Auth::user();

            // Get current month consumption - using start_date
            $currentMonth = WaterConsumption::where('custcode', $consumer->custcode)
                ->whereMonth('start_date', now()->month)
                ->whereYear('start_date', now()->year)
                ->sum('consumption');

            // Get previous month consumption
            $previousMonth = WaterConsumption::where('custcode', $consumer->custcode)
                ->whereMonth('start_date', now()->subMonth()->month)
                ->whereYear('start_date', now()->subMonth()->year)
                ->sum('consumption');

            // Calculate percentage change
            $percentageChange = 0;
            if ($previousMonth > 0) {
                $percentageChange = (($currentMonth - $previousMonth) / $previousMonth) * 100;
            }

            // Get last 6 months consumption for chart
            $monthlyData = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $consumption = WaterConsumption::where('custcode', $consumer->custcode)
                    ->whereMonth('start_date', $date->month)
                    ->whereYear('start_date', $date->year)
                    ->sum('consumption');

                $monthlyData[] = [
                    'month' => $date->format('M Y'),
                    'consumption' => $consumption,
                    'reports_count' => Report::where('custcode', $consumer->custcode)
                        ->whereMonth('created_at', $date->month)
                        ->whereYear('created_at', $date->year)
                        ->count()
                ];
            }

            // Get recent reports with AI analysis
            $recentReports = Report::with(['waterConsumption', 'aiResponse'])
                ->where('custcode', $consumer->custcode)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Get AI analysis summary
            $aiSummary = [
                'total_analyzed' => 0,
                'leaks_detected' => 0,
                'critical_issues' => 0,
            ];

            // Only try to query if table exists
            try {
                $aiSummary = [
                    'total_analyzed' => MultimodalAiResponse::whereHas('report', function ($query) use ($consumer) {
                        $query->where('custcode', $consumer->custcode);
                    })->count(),
                    'leaks_detected' => MultimodalAiResponse::whereHas('report', function ($query) use ($consumer) {
                        $query->where('custcode', $consumer->custcode);
                    })->where('leak_detected', true)->count(),
                    'critical_issues' => MultimodalAiResponse::whereHas('report', function ($query) use ($consumer) {
                        $query->where('custcode', $consumer->custcode);
                    })->where('severity', 'critical')->count(),
                ];
            } catch (\Exception $e) {
                Log::warning('AI summary query failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'consumer' => [
                        'name' => $consumer->name,
                        'account_number' => $consumer->account_number,
                        'meter_number' => $consumer->meter_number,
                        'address' => $consumer->address,
                        'connection_type' => $consumer->connection_type,
                        'status' => $consumer->status
                    ],
                    'statistics' => [
                        'current_month_consumption' => $currentMonth,
                        'previous_month_consumption' => $previousMonth,
                        'percentage_change' => round($percentageChange, 2),
                        'total_reports' => Report::where('custcode', $consumer->custcode)->count(),
                        'total_consumption_year' => WaterConsumption::where('custcode', $consumer->custcode)
                            ->whereYear('start_date', now()->year)
                            ->sum('consumption')
                    ],
                    'ai_summary' => $aiSummary,
                    'monthly_data' => $monthlyData,
                    'recent_reports' => $recentReports->map(function ($report) {
                        return $this->formatReport($report);
                    })
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch dashboard data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a report
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateReport(Request $request, $id)
    {
        try {
            $consumer = Auth::user();

            $report = Report::where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'content' => 'sometimes|string|min:10|max:1000',
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->has('content')) {
                $report->content = $request->content;
            }

            if ($request->hasFile('image')) {
                // Delete old image
                if ($report->image && Storage::disk('public')->exists($report->image)) {
                    Storage::disk('public')->delete($report->image);
                }

                $imagePath = $request->file('image')->store('reports', 'public');
                $report->image = $imagePath;

                // Re-analyze with AI if image is updated
                $fullImagePath = Storage::disk('public')->path($imagePath);
                $consumptionRecords = $this->getHistoricalConsumptionData($consumer->custcode, $report->water_consumption_id);
                $aiData = [
                    'report_content' => $report->content,
                    'consumption_records' => $consumptionRecords,
                    'water_consumption_id' => $report->water_consumption_id
                ];
                $this->analyzeReportWithAI($report, $fullImagePath, $aiData);
            }

            $report->save();

            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully',
                'data' => [
                    'report' => $this->formatReport($report->fresh(['waterConsumption', 'consumer', 'aiResponse']))
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a report
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteReport($id)
    {
        try {
            $consumer = Auth::user();

            $report = Report::where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found'
                ], 404);
            }

            // Delete AI response if exists
            if ($report->aiResponse) {
                $report->aiResponse->delete();
            }

            // Delete image file
            if ($report->image && Storage::disk('public')->exists($report->image)) {
                Storage::disk('public')->delete($report->image);
            }

            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retry AI analysis for a report
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function retryAnalysis($id)
    {
        try {
            $consumer = Auth::user();

            $report = Report::where('id', $id)
                ->where('custcode', $consumer->custcode)
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found'
                ], 404);
            }

            // Check if image exists
            if (!$report->image || !Storage::disk('public')->exists($report->image)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report image not found'
                ], 404);
            }

            $fullImagePath = Storage::disk('public')->path($report->image);
            $consumptionRecords = $this->getHistoricalConsumptionData($consumer->custcode, $report->water_consumption_id);
            $aiData = [
                'report_content' => $report->content,
                'consumption_records' => $consumptionRecords,
                'water_consumption_id' => $report->water_consumption_id
            ];

            $this->analyzeReportWithAI($report, $fullImagePath, $aiData);

            return response()->json([
                'success' => true,
                'message' => 'AI analysis retriggered successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retry analysis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retry analysis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format report data for API response
     *
     * @param Report $report
     * @return array
     */
    private function formatReport($report)
    {
        return [
            'id' => $report->id,
            'image_url' => $report->image ? asset('storage/' . $report->image) : null,
            'content' => $report->content,
            'created_at' => $report->created_at->toISOString(),
            'updated_at' => $report->updated_at->toISOString(),
            'status' => $report->status,
            'admin_feedback' => $report->admin_feedback,
            'resolution_notes' => $report->resolution_notes,
            'resolved_at' => $report->resolved_at ? $report->resolved_at->toISOString() : null,
            'has_ai_analysis' => $report->aiResponse ? true : false,
            'ai_analysis_status' => $report->aiResponse ? 'completed' : 'pending',
            'water_consumption' => $report->waterConsumption ? $this->formatWaterConsumption($report->waterConsumption) : null,
            'consumer' => $report->consumer ? [
                'name' => $report->consumer->name,
                'account_number' => $report->consumer->account_number,
                'meter_number' => $report->consumer->meter_number
            ] : null,
            'ai_summary' => $report->aiResponse ? [
                'leak_detected' => $report->aiResponse->leak_detected,
                'severity' => $report->aiResponse->severity,
                'priority' => $report->aiResponse->priority,
                'summary' => $report->aiResponse->summary
            ] : null
        ];
    }

    /**
     * Format water consumption data for API response
     *
     * @param WaterConsumption $consumption
     * @return array
     */
    private function formatWaterConsumption($consumption)
    {
        return [
            'id' => $consumption->id,
            'current_reading' => $consumption->current_reading,
            'previous_reading' => $consumption->previous_reading,
            'consumption' => $consumption->consumption,
            'formatted_consumption' => $consumption->consumption . ' m³',
            'start_date' => $consumption->start_date ? $consumption->start_date->format('Y-m-d') : null,
            'end_date' => $consumption->end_date ? $consumption->end_date->format('Y-m-d') : null,
            'reports_count' => $consumption->reports->count(),
            'reports' => $consumption->reports->map(function ($report) {
                return [
                    'id' => $report->id,
                    'image_url' => $report->image ? asset('storage/' . $report->image) : null,
                    'content' => $report->content,
                    'created_at' => $report->created_at->toISOString(),
                    'status' => $report->status,
                    'admin_feedback' => $report->admin_feedback
                ];
            })
        ];
    }
}
