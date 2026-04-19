<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\MultimodalAiResponse;
use App\Models\WaterConsumption;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
                    'status' => $report->status,
                    'admin_feedback' => $report->admin_feedback,
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
            'status' => $report->status,
            'admin_feedback' => $report->admin_feedback,
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

    /**
     * Retry AI analysis for a report
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */

    /**
     * Retry AI analysis for a report
     */
    public function retryAnalysis($id)
    {
        try {
            Log::info('=== RETRY ANALYSIS STARTED ===');
            Log::info('Report ID: ' . $id);

            $user = Auth::user();

            if (!$user) {
                Log::error('No authenticated user');
                if (request()->wantsJson()) {
                    return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
                }
                return redirect()->route('login');
            }

            // Check if user is admin
            $isAdmin = $user instanceof \App\Models\User && $user->role === 'admin';

            if (!$isAdmin) {
                Log::error('User is not admin: ' . $user->email);
                $message = 'Unauthorized. Admin access required.';
                if (request()->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $message], 403);
                }
                return redirect()->back()->with('error', $message);
            }

            $report = Report::find($id);

            if (!$report) {
                Log::error('Report not found: ' . $id);
                $message = 'Report not found';
                if (request()->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $message], 404);
                }
                return redirect()->back()->with('error', $message);
            }

            Log::info('Report found - ID: ' . $report->id . ', Content: ' . substr($report->content, 0, 50));

            // Check if image exists
            if (!$report->image) {
                Log::error('No image path for report: ' . $report->id);
                $message = 'Report image not found';
                if (request()->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $message], 404);
                }
                return redirect()->back()->with('error', $message);
            }

            $fullImagePath = Storage::disk('public')->path($report->image);
            Log::info('Image path: ' . $fullImagePath);

            if (!file_exists($fullImagePath)) {
                Log::error('Image file does not exist at: ' . $fullImagePath);
                $message = 'Report image file not found';
                if (request()->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $message], 404);
                }
                return redirect()->back()->with('error', $message);
            }

            Log::info('Image size: ' . filesize($fullImagePath) . ' bytes');

            // Get consumption records
            $consumptionRecords = $this->getHistoricalConsumptionData($report->custcode, $report->water_consumption_id);
            Log::info('Consumption records count: ' . count($consumptionRecords));

            // Prepare AI data
            $aiData = [
                'report_content' => $report->content,
                'consumption_records' => $consumptionRecords,
                'water_consumption_id' => $report->water_consumption_id
            ];

            // Directly call the AI analysis without checking health first
            Log::info('Calling AI analysis directly...');
            $success = $this->analyzeReportWithAI($report, $fullImagePath, $aiData);

            Log::info('AI analysis result: ' . ($success ? 'SUCCESS' : 'FAILED'));

            if ($success) {
                $message = 'AI analysis retriggered successfully!';
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => $message,
                        'data' => [
                            'analysis' => $report->fresh()->aiResponse
                        ]
                    ]);
                }
                return redirect()->back()->with('success', $message);
            } else {
                $message = 'AI analysis failed. Please check logs for details.';
                if (request()->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $message], 500);
                }
                return redirect()->back()->with('error', $message);
            }
        } catch (\Exception $e) {
            Log::error('Failed to retry analysis: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            $message = 'Failed to retry analysis: ' . $e->getMessage();
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => $message], 500);
            }
            return redirect()->back()->with('error', $message);
        }
    }

    /**
     * Analyze report with AI service
     */
    private function analyzeReportWithAI($report, $imagePath, $aiData)
    {
        try {
            $aiApiUrl = env('PYTHON_AI_API_URL', 'http://127.0.0.1:5001');
            Log::info('AI API URL: ' . $aiApiUrl);

            // Check if image file exists
            if (!file_exists($imagePath)) {
                Log::error('Image file not found: ' . $imagePath);
                return false;
            }

            Log::info('Image file size: ' . filesize($imagePath) . ' bytes');

            // Prepare billing data
            $billingData = [
                'report_content' => $aiData['report_content'],
                'consumption_records' => $aiData['consumption_records']
            ];

            Log::info('Sending POST request to AI service endpoint: /analyze-leak');
            Log::info('Report content length: ' . strlen($aiData['report_content']));
            Log::info('Consumption records: ' . json_encode($aiData['consumption_records']));

            // Create multipart form data request
            $response = Http::timeout(120) // Increased timeout for AI processing
                ->attach(
                    'image',
                    file_get_contents($imagePath),
                    basename($imagePath)
                )
                ->post($aiApiUrl . '/analyze-leak', [
                    'billing_data' => json_encode($billingData)
                ]);

            Log::info('AI response status: ' . $response->status());
            Log::info('AI response body: ' . substr($response->body(), 0, 500));

            if ($response->successful()) {
                $aiResult = $response->json();
                Log::info('AI result success flag: ' . ($aiResult['success'] ?? 'not set'));

                if (isset($aiResult['success']) && $aiResult['success'] === true && isset($aiResult['data'])) {
                    // Store AI analysis result
                    $this->storeAiResponse($report, $aiResult['data']);
                    Log::info('AI analysis completed and stored successfully');
                    return true;
                } else {
                    Log::warning('AI result missing expected fields: ' . json_encode($aiResult));
                    return false;
                }
            } else {
                Log::error('AI service request failed with status: ' . $response->status());
                Log::error('Response body: ' . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error('AI analysis exception: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Check if AI service is available (optional, for health checks only)
     */
    private function checkAIServiceAvailability()
    {
        try {
            $aiApiUrl = env('PYTHON_AI_API_URL', 'http://127.0.0.1:5001');

            $cacheKey = 'ai_service_health';
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::timeout(3)->get($aiApiUrl . '/health');

            $isAvailable = $response->successful() &&
                isset($response->json()['analyzer_ready']) &&
                $response->json()['analyzer_ready'] === true;

            Cache::put($cacheKey, $isAvailable, 30);

            return $isAvailable;
        } catch (\Exception $e) {
            Log::error('AI service health check failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get historical consumption data for AI analysis
     */
    private function getHistoricalConsumptionData($custcode, $currentConsumptionId)
    {
        try {
            $currentConsumption = WaterConsumption::find($currentConsumptionId);

            if (!$currentConsumption) {
                return [];
            }

            $historicalRecords = WaterConsumption::where('custcode', $custcode)
                ->where('id', '!=', $currentConsumptionId)
                ->orderBy('start_date', 'desc')
                ->limit(6)
                ->get();

            $consumptionRecords = [];

            // Add current consumption record
            $consumptionRecords[] = [
                'id' => $currentConsumption->id,
                'consumption' => (float) $currentConsumption->consumption,
                'current_reading' => (float) $currentConsumption->current_reading,
                'previous_reading' => (float) $currentConsumption->previous_reading,
                'billing_period' => $currentConsumption->start_date ?
                    $currentConsumption->start_date->format('F Y') : null,
                'start_date' => $currentConsumption->start_date ? $currentConsumption->start_date->format('Y-m-d') : null,
                'end_date' => $currentConsumption->end_date ? $currentConsumption->end_date->format('Y-m-d') : null,
            ];

            // Add historical records
            foreach ($historicalRecords as $record) {
                $consumptionRecords[] = [
                    'id' => $record->id,
                    'consumption' => (float) $record->consumption,
                    'current_reading' => (float) $record->current_reading,
                    'previous_reading' => (float) $record->previous_reading,
                    'billing_period' => $record->start_date ?
                        $record->start_date->format('F Y') : null,
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
     * Store AI response in database
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
                    'text_consistency' => is_array($analysisData['text_consistency'] ?? null) ?
                        json_encode($analysisData['text_consistency']) : $analysisData['text_consistency'] ?? null,
                    'consumption_analysis' => is_array($analysisData['consumption_analysis'] ?? null) ?
                        json_encode($analysisData['consumption_analysis']) : $analysisData['consumption_analysis'] ?? null,
                    'trend_analysis' => is_array($analysisData['trend_analysis'] ?? null) ?
                        json_encode($analysisData['trend_analysis']) : $analysisData['trend_analysis'] ?? null,
                    'raw_response' => json_encode($analysisData),
                    'analyzed_at' => now(),
                    'is_cached' => $analysisData['is_fallback'] ?? false,
                    'is_fallback' => $analysisData['is_fallback'] ?? false
                ]
            );

            Log::info('AI response stored for report: ' . $report->id);
        } catch (\Exception $e) {
            Log::error('Failed to store AI response: ' . $e->getMessage());
        }
    }

    /**
     * Update report status
     */
    /**
     * Update report status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            Log::info('updateStatus called', [
                'id' => $id,
                'status' => $request->status,
                'admin_feedback' => $request->admin_feedback,
                'user_id' => auth()->id()
            ]);

            $user = Auth::user();

            if (!$user) {
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
                }
                return redirect()->route('login');
            }

            // Check if user is admin
            $isAdmin = $user instanceof \App\Models\User && $user->role === 'admin';

            if (!$isAdmin) {
                $message = 'Unauthorized. Admin access required.';
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $message], 403);
                }
                return redirect()->back()->with('error', $message);
            }

            $validated = $request->validate([
                'status' => 'sometimes|required|in:pending,ongoing,resolved,closed,rejected',
                'resolution_notes' => 'nullable|string|max:1000',
                'admin_feedback' => 'nullable|string|max:5000',
            ]);

            $report = Report::findOrFail($id);

            Log::info('Before update - Current status: ' . $report->status);
            Log::info('Before update - Current admin_feedback: ' . $report->admin_feedback);

            $updateData = [];

            // Update status if provided
            if ($request->has('status')) {
                $updateData['status'] = $validated['status'];

                // If status is resolved, set resolved_at
                if ($validated['status'] === 'resolved') {
                    $updateData['resolved_at'] = now();
                    $updateData['resolved_by'] = $user->id;
                    if ($request->has('resolution_notes')) {
                        $updateData['resolution_notes'] = $validated['resolution_notes'] ?? null;
                    }
                }
                // If status is closed or rejected, also set resolved_at if not already set
                elseif (in_array($validated['status'], ['closed', 'rejected']) && !$report->resolved_at) {
                    $updateData['resolved_at'] = now();
                    $updateData['resolved_by'] = $user->id;
                    if ($request->has('resolution_notes')) {
                        $updateData['resolution_notes'] = $validated['resolution_notes'] ?? null;
                    }
                }
                // If status is changed to pending or ongoing, clear resolved fields
                elseif (in_array($validated['status'], ['pending', 'ongoing'])) {
                    $updateData['resolved_at'] = null;
                    $updateData['resolved_by'] = null;
                    $updateData['resolution_notes'] = null;
                }
            }

            // Update admin feedback if provided
            if ($request->has('admin_feedback')) {
                $updateData['admin_feedback'] = $validated['admin_feedback'];
            }

            // Only update if there are changes
            if (!empty($updateData)) {
                $report->update($updateData);
                // Refresh the report to get updated data
                $report->refresh();
            }

            Log::info('After update - New status: ' . $report->status);
            Log::info('After update - New admin_feedback: ' . $report->admin_feedback);
            Log::info('After update - resolved_at: ' . $report->resolved_at);
            Log::info('After update - resolution_notes: ' . $report->resolution_notes);

            $message = $request->has('admin_feedback') ? 'Admin feedback updated successfully' : 'Report status updated successfully';

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => [
                        'id' => $report->id,
                        'status' => $report->status,
                        'status_label' => $report->status_label,
                        'status_color' => $report->status_color,
                        'resolved_at' => $report->resolved_at,
                        'resolution_notes' => $report->resolution_notes,
                        'admin_feedback' => $report->admin_feedback,
                    ]
                ]);
            }

            // For Inertia requests, redirect back with success message and updated data
            return redirect()->back()->with([
                'success' => $message,
                'updated_status' => $report->status ?? null,
                'updated_feedback' => $report->admin_feedback ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update report: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            $message = 'Failed to update report: ' . $e->getMessage();

            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $message], 500);
            }

            return redirect()->back()->with('error', $message);
        }
    }

    /**
     * Get status history for a report
     */
    public function getStatusHistory($id)
    {
        try {
            $report = Report::with(['resolver'])->findOrFail($id);

            $history = [
                'current_status' => [
                    'status' => $report->status,
                    'label' => $report->status_label,
                    'color' => $report->status_color,
                    'updated_at' => $report->updated_at,
                ],
                'resolved_at' => $report->resolved_at,
                'resolution_notes' => $report->resolution_notes,
                'resolved_by' => $report->resolver ? [
                    'id' => $report->resolver->id,
                    'name' => $report->resolver->name,
                    'email' => $report->resolver->email,
                ] : null,
            ];

            return response()->json([
                'success' => true,
                'data' => $history
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get status history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get status history'
            ], 500);
        }
    }

    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();
        return redirect()->route('reports.index')->with('success', 'Report deleted successfully.');
    }
}
