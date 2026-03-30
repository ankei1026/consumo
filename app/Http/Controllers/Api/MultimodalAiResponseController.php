<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\MultimodalAiResponse;
use App\Models\ConsumptionAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class MultimodalAiResponseController extends Controller
{
    protected $pythonApiUrl;
    
    public function __construct()
    {
        // Python Flask API endpoint
        $this->pythonApiUrl = env('PYTHON_AI_API_URL', 'http://127.0.0.1:5001');
    }
    
    /**
     * Analyze a report using the Python AI service
     */
    public function analyze(Request $request, Report $report)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
            'billing_data' => 'nullable|json',
        ]);
        
        try {
            // Check if we have a cached response
            $cachedResponse = $this->checkCache($report, $request->input('billing_data'));
            
            if ($cachedResponse) {
                return response()->json([
                    'success' => true,
                    'cached' => true,
                    'data' => $cachedResponse,
                    'message' => 'Using cached AI analysis result'
                ]);
            }
            
            // Send to Python AI service
            $response = $this->callPythonAIService($request, $report);
            
            if (!$response->successful()) {
                throw new \Exception('AI Service error: ' . $response->body());
            }
            
            $aiResult = $response->json()['data'];
            
            // Store in database
            $storedResponse = $this->storeAIAnalysis($report, $aiResult, $request->input('billing_data'));
            
            return response()->json([
                'success' => true,
                'cached' => false,
                'data' => $storedResponse,
                'message' => 'AI analysis completed successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('AI Analysis failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Analysis failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Call the Python Flask AI service
     */
    private function callPythonAIService(Request $request, Report $report)
    {
        // Prepare the request to Python service
        $multipart = [];
        
        // Add image file
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $multipart[] = [
                'name' => 'image',
                'contents' => fopen($image->getPathname(), 'r'),
                'filename' => $image->getClientOriginalName()
            ];
        } elseif ($report->image_path && file_exists(storage_path('app/public/' . $report->image_path))) {
            // Use stored image if no new image uploaded
            $imagePath = storage_path('app/public/' . $report->image_path);
            $multipart[] = [
                'name' => 'image',
                'contents' => fopen($imagePath, 'r'),
                'filename' => basename($imagePath)
            ];
        } else {
            throw new \Exception('No image provided for analysis');
        }
        
        // Prepare billing data
        $billingData = $request->input('billing_data');
        if ($billingData && is_string($billingData)) {
            $billingData = json_decode($billingData, true);
        }
        
        // Add report content and consumption data
        $analysisData = [
            'report_content' => $report->report_content ?? $request->input('report_content', ''),
            'consumption_records' => $billingData['consumption_records'] ?? $report->consumption_records ?? []
        ];
        
        $multipart[] = [
            'name' => 'billing_data',
            'contents' => json_encode($analysisData)
        ];
        
        // Make HTTP request to Python service
        return Http::timeout(60) // 60 seconds timeout for AI processing
            ->attach($multipart)
            ->post($this->pythonApiUrl . '/analyze-leak');
    }
    
    /**
     * Store AI analysis results in database
     */
    private function storeAIAnalysis(Report $report, array $aiResult, $billingData = null)
    {
        try {
            DB::beginTransaction();
            
            // Generate cache key
            $cacheKey = $this->generateCacheKey($report, $billingData);
            
            // Store main AI response
            $aiResponse = MultimodalAiResponse::updateOrCreate(
                ['report_id' => $report->id, 'cache_key' => $cacheKey],
                [
                    'leak_detected' => $aiResult['leak_detected'] ?? false,
                    'leak_type' => $aiResult['leak_type'] ?? null,
                    'severity' => $aiResult['severity'] ?? null,
                    'priority' => $aiResult['priority'] ?? null,
                    'image_analysis' => $aiResult['image_analysis'] ?? null,
                    'recommendation' => $aiResult['recommendation'] ?? null,
                    'summary' => $aiResult['summary'] ?? null,
                    'text_consistency' => $aiResult['text_consistency'] ?? null,
                    'consumption_analysis' => $aiResult['consumption_analysis'] ?? null,
                    'trend_analysis' => $aiResult['trend_analysis'] ?? null,
                    'raw_response' => $aiResult,
                    'image_hash' => $this->hashImage($report->image_path),
                    'report_content_hash' => md5($report->report_content ?? ''),
                    'analysis_version' => '1.0.0',
                    'analyzed_at' => now(),
                    'expires_at' => $this->calculateExpiration($aiResult),
                    'is_cached' => true
                ]
            );
            
            // Store consumption analysis separately if data exists
            if (isset($aiResult['consumption_analysis']) && !empty($aiResult['consumption_analysis'])) {
                $consumptionData = $aiResult['consumption_analysis'];
                ConsumptionAnalysis::updateOrCreate(
                    ['report_id' => $report->id],
                    [
                        'current_consumption' => $consumptionData['current_consumption'] ?? 0,
                        'average_consumption' => $consumptionData['average_consumption'] ?? 0,
                        'has_spike' => $consumptionData['has_spike'] ?? false,
                        'spike_percentage' => $consumptionData['spike_percentage'] ?? 0,
                        'analysis' => $consumptionData['analysis'] ?? null,
                        'historical_records' => $consumptionData['historical_records'] ?? null
                    ]
                );
            }
            
            // Update report with AI analysis summary
            $report->update([
                'ai_analyzed_at' => now(),
                'leak_detected' => $aiResult['leak_detected'] ?? false,
                'severity' => $aiResult['severity'] ?? null,
                'ai_recommendation' => $aiResult['recommendation'] ?? null
            ]);
            
            DB::commit();
            
            return $aiResponse;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to store AI analysis', [
                'report_id' => $report->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Get AI analysis for a specific report
     */
    public function show(Report $report)
    {
        $analysis = MultimodalAiResponse::where('report_id', $report->id)
            ->with('report')
            ->first();
            
        if (!$analysis) {
            return response()->json([
                'success' => false,
                'message' => 'No AI analysis found for this report'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $analysis
        ]);
    }
    
    /**
     * Get all AI analyses with filters
     */
    public function index(Request $request)
    {
        $query = MultimodalAiResponse::with('report');
        
        // Filter by leak detection
        if ($request->has('leak_detected')) {
            $query->where('leak_detected', $request->boolean('leak_detected'));
        }
        
        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }
        
        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        
        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('analyzed_at', '>=', $request->from_date);
        }
        
        if ($request->has('to_date')) {
            $query->whereDate('analyzed_at', '<=', $request->to_date);
        }
        
        $perPage = $request->get('per_page', 15);
        $analyses = $query->latest('analyzed_at')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $analyses
        ]);
    }
    
    /**
     * Get statistics about AI analyses
     */
    public function statistics()
    {
        $stats = [
            'total_analyses' => MultimodalAiResponse::count(),
            'leak_detected_count' => MultimodalAiResponse::where('leak_detected', true)->count(),
            'leak_detection_rate' => $this->calculateLeakDetectionRate(),
            'severity_breakdown' => $this->getSeverityBreakdown(),
            'priority_breakdown' => $this->getPriorityBreakdown(),
            'recent_analyses' => MultimodalAiResponse::with('report')
                ->latest('analyzed_at')
                ->limit(10)
                ->get()
                ->map(function ($analysis) {
                    return [
                        'id' => $analysis->id,
                        'report_id' => $analysis->report_id,
                        'leak_detected' => $analysis->leak_detected,
                        'severity' => $analysis->severity,
                        'analyzed_at' => $analysis->analyzed_at
                    ];
                })
        ];
        
        return response()->json([
            'success' => true,
            'statistics' => $stats
        ]);
    }
    
    /**
     * Re-analyze a report (force new AI analysis)
     */
    public function reanalyze(Request $request, Report $report)
    {
        try {
            // Delete existing cache
            MultimodalAiResponse::where('report_id', $report->id)->delete();
            ConsumptionAnalysis::where('report_id', $report->id)->delete();
            
            // Create new request with existing data
            $newRequest = new Request();
            $newRequest->merge([
                'billing_data' => json_encode([
                    'consumption_records' => $report->consumption_records ?? []
                ])
            ]);
            
            // If report has image, attach it
            if ($report->image_path && file_exists(storage_path('app/public/' . $report->image_path))) {
                $newRequest->files->set('image', new \Illuminate\Http\UploadedFile(
                    storage_path('app/public/' . $report->image_path),
                    basename($report->image_path)
                ));
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'No image available for re-analysis'
                ], 400);
            }
            
            // Perform analysis
            return $this->analyze($newRequest, $report);
            
        } catch (\Exception $e) {
            Log::error('Re-analysis failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Re-analysis failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete AI analysis for a report
     */
    public function destroy(Report $report)
    {
        try {
            $deleted = MultimodalAiResponse::where('report_id', $report->id)->delete();
            ConsumptionAnalysis::where('report_id', $report->id)->delete();
            
            return response()->json([
                'success' => true,
                'message' => "Deleted {$deleted} AI analysis records"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check if we have a valid cached response
     */
    private function checkCache(Report $report, $billingData = null): ?array
    {
        $cacheKey = $this->generateCacheKey($report, $billingData);
        
        $cached = MultimodalAiResponse::where('cache_key', $cacheKey)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();
            
        if ($cached) {
            return $cached->toArray();
        }
        
        return null;
    }
    
    /**
     * Generate cache key from report and billing data
     */
    private function generateCacheKey(Report $report, $billingData = null): string
    {
        $data = [
            'report_id' => $report->id,
            'image_hash' => $this->hashImage($report->image_path),
            'report_content' => md5($report->report_content ?? ''),
            'billing_data' => md5(json_encode($billingData ?? [])),
            'version' => '1.0.0'
        ];
        
        return 'ai_' . md5(json_encode($data));
    }
    
    /**
     * Hash image file
     */
    private function hashImage(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }
        
        $fullPath = storage_path('app/public/' . $imagePath);
        
        if (file_exists($fullPath)) {
            return md5_file($fullPath);
        }
        
        return null;
    }
    
    /**
     * Calculate expiration based on severity
     */
    private function calculateExpiration(array $aiResult): \Carbon\Carbon
    {
        $severity = $aiResult['severity'] ?? 'low';
        
        $days = match($severity) {
            'critical' => 1,
            'high' => 3,
            'medium' => 7,
            'low' => 14,
            default => 30
        };
        
        return now()->addDays($days);
    }
    
    /**
     * Calculate leak detection rate
     */
    private function calculateLeakDetectionRate(): float
    {
        $total = MultimodalAiResponse::count();
        $leaks = MultimodalAiResponse::where('leak_detected', true)->count();
        
        if ($total === 0) {
            return 0;
        }
        
        return round(($leaks / $total) * 100, 2);
    }
    
    /**
     * Get severity breakdown
     */
    private function getSeverityBreakdown(): array
    {
        return MultimodalAiResponse::select('severity', DB::raw('count(*) as count'))
            ->whereNotNull('severity')
            ->groupBy('severity')
            ->pluck('count', 'severity')
            ->toArray();
    }
    
    /**
     * Get priority breakdown
     */
    private function getPriorityBreakdown(): array
    {
        return MultimodalAiResponse::select('priority', DB::raw('count(*) as count'))
            ->whereNotNull('priority')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();
    }
}