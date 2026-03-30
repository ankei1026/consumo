<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicAdvisory;
use Illuminate\Http\Request;

class ConsumerPublicAdvisoryController extends Controller
{
    /**
     * Get public advisories for consumers with priority:
     * 1. On-going (highest priority)
     * 2. Upcoming
     * 3. Done (excluded - not shown)
     */
    public function index(Request $request)
    {
        // Get authenticated consumer
        $consumer = $request->user();

        // Get all advisories except 'done' status
        $advisories = PublicAdvisory::whereIn('status', ['on-going', 'upcoming'])
            ->latest()
            ->get()
            ->map(function ($advisory) use ($consumer) {
                // Format for Flutter app
                return [
                    'id' => $advisory->id,
                    'title' => $advisory->title,
                    'message' => $advisory->description,
                    'type' => $advisory->type,
                    'status' => $advisory->status,
                    'time_label' => $this->formatTimeLabel($advisory->created_at),
                    'icon' => $this->getIconForType($advisory->type),
                    'accent' => $this->getColorForType($advisory->type),
                    'priority' => $advisory->status === 'on-going' ? 1 : 2, // For sorting
                ];
            })
            ->sortBy('priority') // Sort by priority (on-going first)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $advisories,
            'count' => $advisories->count()
        ]);
    }

    /**
     * Get single advisory details
     */
    public function show(Request $request, $id)
    {
        $consumer = $request->user();

        $advisory = PublicAdvisory::findOrFail($id);

        // Don't show done advisories
        if ($advisory->status === 'done') {
            return response()->json([
                'success' => false,
                'message' => 'Advisory not available'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $advisory->id,
                'title' => $advisory->title,
                'message' => $advisory->description,
                'type' => $advisory->type,
                'status' => $advisory->status,
                'time_label' => $this->formatTimeLabel($advisory->created_at),
                'full_date' => $advisory->created_at->format('F j, Y g:i A'),
                'icon' => $this->getIconForType($advisory->type),
                'accent' => $this->getColorForType($advisory->type),
            ]
        ]);
    }

    /**
     * Get unread count (if you implement read receipts)
     */
    public function unreadCount(Request $request)
    {
        $consumer = $request->user();

        // If you have an advisory_views table for tracking reads
        $unreadCount = PublicAdvisory::whereIn('status', ['on-going', 'upcoming'])
            ->whereDoesntHave('views', function($query) use ($consumer) {
                $query->where('consumer_id', $consumer->id);
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount
            ]
        ]);
    }

    /**
     * Format time label for display
     */
    private function formatTimeLabel($date)
    {
        $now = now();
        $diff = $now->diffInHours($date);

        if ($diff < 24) {
            return $date->format('g:i A') . ' • Today';
        } elseif ($diff < 48) {
            return 'Yesterday • ' . $date->format('g:i A');
        } else {
            return $date->format('M j, Y • g:i A');
        }
    }

    /**
     * Get icon for advisory type
     */
    private function getIconForType($type)
    {
        return match($type) {
            'emergency' => 'warning_amber_rounded',
            'maintenance' => 'build_circle_rounded',
            default => 'campaign_outlined',
        };
    }

    /**
     * Get color for advisory type
     */
    private function getColorForType($type)
    {
        return match($type) {
            'emergency' => '#EF4444', // Red
            'maintenance' => '#F59E0B', // Amber/Yellow
            default => '#2563EB', // Blue
        };
    }
}
