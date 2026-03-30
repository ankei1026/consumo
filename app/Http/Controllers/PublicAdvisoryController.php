<?php
// app/Http/Controllers/PublicAdvisoryController.php

namespace App\Http\Controllers;

use App\Jobs\SendAdvisorySmsToAllConsumers;
use App\Models\PublicAdvisory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PublicAdvisoryController extends Controller
{
    /**
     * Display a listing of advisories with optional status filter.
     */
    public function index(Request $request)
    {
        $query = PublicAdvisory::latest();

        // Filter by status if provided
        if ($request->has('status') && in_array($request->status, ['done', 'on-going', 'upcoming'])) {
            $query->where('status', $request->status);
        }

        $advisories = $query->paginate(10);

        return Inertia::render('PublicAdvisory/Index', [
            'advisories' => $advisories,
            'currentStatus' => $request->status ?? 'all',
        ]);
    }

    /**
     * Show the form for creating a new advisory.
     */
    public function create()
    {
        return Inertia::render('PublicAdvisory/Create');
    }

    /**
     * Store a newly created advisory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:general,emergency,maintenance',
        ]);

        $advisory = PublicAdvisory::create($validated);

        // Log the creation
        Log::info('Advisory created', [
            'advisory_id' => $advisory->id,
            'title' => $advisory->title,
            'type' => $advisory->type,
        ]);

        // Dispatch job to send SMS to all consumers
        SendAdvisorySmsToAllConsumers::dispatch($advisory);

        Log::info('SMS job dispatched', ['advisory_id' => $advisory->id]);

        return redirect()->route('public-advisories.index')
            ->with('success', 'Advisory posted successfully.');
    }

    /**
     * Display the specified advisory.
     */
    public function show(PublicAdvisory $publicAdvisory)
    {
        return Inertia::render('PublicAdvisory/Show', [
            'advisory' => $publicAdvisory
        ]);
    }

    /**
     * Show the form for editing the specified advisory.
     */
    public function edit(PublicAdvisory $publicAdvisory)
    {
        return Inertia::render('PublicAdvisory/Edit', [
            'advisory' => $publicAdvisory
        ]);
    }

    /**
     * Update the specified advisory.
     */

    public function update(Request $request, PublicAdvisory $publicAdvisory)
    {
        // Allow partial updates (just status)
        $rules = [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'type' => 'sometimes|in:general,emergency,maintenance',
            'status' => 'sometimes|in:done,on-going,upcoming',
        ];

        $validated = $request->validate($rules);

        $publicAdvisory->update($validated);

        // If it's an AJAX request or just status update, return appropriate response
        // if ($request->wantsJson() || $request->has('status')) {
        //     return response()->json([
        //         'success' => true,
        //         'message' => 'Status updated successfully',
        //         'advisory' => $publicAdvisory
        //     ]);
        // }

        return redirect()->route('public-advisories.index')
            ->with('success', 'Advisory updated successfully.');
    }

    /**
     * Remove the specified advisory.
     */
    public function destroy(PublicAdvisory $publicAdvisory)
    {
        $publicAdvisory->delete();

        return redirect()->route('public-advisories.index')
            ->with('success', 'Advisory deleted successfully.');
    }
}
