<?php

namespace App\Http\Controllers;

use App\Models\CustomerSupport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CustomerSupportController extends Controller
{
    /**
     * Display a listing of support tickets.
     */
    public function index(Request $request)
    {
        try {
            $query = CustomerSupport::with('consumer')
                ->orderBy('created_at', 'desc');

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by subject
            if ($request->has('subject') && $request->subject) {
                $query->where('subject', $request->subject);
            }

            // Search by consumer name, account number, or message
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('consumer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('account_number', 'like', "%{$search}%")
                            ->orWhere('custcode', 'like', "%{$search}%");
                    })->orWhere('message', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            // Date range filter
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            // Get paginated results
            $perPage = $request->get('per_page', 15);
            $tickets = $query->paginate($perPage)->through(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'consumer_id' => $ticket->consumer_id,
                    'subject' => $ticket->subject,
                    'formatted_subject' => $ticket->formatted_subject,
                    'message' => $ticket->message,
                    'image' => $ticket->image ? asset('storage/' . $ticket->image) : null,
                    'status' => $ticket->status ?? 'pending',
                    'admin_response' => $ticket->admin_response,
                    'admin_feedback' => $ticket->admin_feedback,
                    'created_at' => $ticket->created_at,
                    'updated_at' => $ticket->updated_at,
                    'resolved_at' => $ticket->resolved_at,
                    'consumer' => $ticket->consumer ? [
                        'name' => $ticket->consumer->name,
                        'account_number' => $ticket->consumer->account_number,
                        'meter_number' => $ticket->consumer->meter_number,
                        'mobile_number' => $ticket->consumer->mobile_number,
                        'address' => $ticket->consumer->address,
                    ] : null,
                ];
            });

            // Prepare filters for the view
            $filters = [
                'status' => $request->status,
                'subject' => $request->subject,
                'search' => $request->search,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ];

            return Inertia::render('CustomerSupport/Index', [
                'tickets' => $tickets,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching support tickets: ' . $e->getMessage());

            return back()->with('error', 'Failed to fetch support tickets');
        }
    }

    /**
     * Display the specified support ticket.
     */
    public function show($id)
    {
        try {
            $ticket = CustomerSupport::with('consumer')->findOrFail($id);

            $formattedTicket = [
                'id' => $ticket->id,
                'consumer_id' => $ticket->consumer_id,
                'subject' => $ticket->subject,
                'formatted_subject' => $ticket->formatted_subject,
                'message' => $ticket->message,
                'image' => $ticket->image ? asset('storage/' . $ticket->image) : null,
                'status' => $ticket->status ?? 'pending',
                'admin_response' => $ticket->admin_response,
                'admin_feedback' => $ticket->admin_feedback,
                'created_at' => $ticket->created_at,
                'updated_at' => $ticket->updated_at,
                'resolved_at' => $ticket->resolved_at,
                'consumer' => $ticket->consumer ? [
                    'name' => $ticket->consumer->name,
                    'account_number' => $ticket->consumer->account_number,
                    'meter_number' => $ticket->consumer->meter_number,
                    'mobile_number' => $ticket->consumer->mobile_number,
                    'address' => $ticket->consumer->address,
                    'email' => $ticket->consumer->email ?? null,
                ] : null,
            ];

            return Inertia::render('CustomerSupport/Show', [
                'ticket' => $formattedTicket,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching support ticket: ' . $e->getMessage());

            return redirect()->route('customer-support.index')
                ->with('error', 'Support ticket not found');
        }
    }

    /**
     * Update the specified support ticket.
     */
    public function update(Request $request, $id)
    {
        try {
            $ticket = CustomerSupport::findOrFail($id);

            Log::info('Updating ticket', [
                'id' => $id,
                'request_data' => $request->all(),
                'has_admin_response' => $request->has('admin_response'),
                'has_admin_feedback' => $request->has('admin_feedback'),
                'has_status' => $request->has('status')
            ]);

            $validated = $request->validate([
                'status' => 'sometimes|required|in:pending,in_progress,resolved,rejected',
                'admin_response' => 'nullable|string|max:5000',
                'admin_feedback' => 'nullable|string|max:5000',
                'resolution_notes' => 'nullable|string|max:1000',
            ]);

            $updateData = [];

            // Update status if provided
            if ($request->has('status')) {
                $updateData['status'] = $validated['status'];

                // Set resolved_at when status is resolved
                if ($validated['status'] === 'resolved' && !$ticket->resolved_at) {
                    $updateData['resolved_at'] = now();
                }
                // Clear resolved_at if status is not resolved
                elseif ($validated['status'] !== 'resolved') {
                    $updateData['resolved_at'] = null;
                }
            }

            // Update admin response if provided
            if ($request->has('admin_response')) {
                $updateData['admin_response'] = $validated['admin_response'];
                Log::info('Setting admin_response', ['response' => $validated['admin_response']]);
            }

            // Update admin feedback if provided
            if ($request->has('admin_feedback')) {
                $updateData['admin_feedback'] = $validated['admin_feedback'];
                Log::info('Setting admin_feedback', ['feedback' => $validated['admin_feedback']]);
            }

            // Update resolution notes if provided
            if ($request->has('resolution_notes')) {
                $updateData['resolution_notes'] = $validated['resolution_notes'];
            }

            // Only update if there are changes
            if (!empty($updateData)) {
                $ticket->update($updateData);
                $ticket->refresh();

                Log::info('Ticket updated successfully', [
                    'id' => $ticket->id,
                    'new_status' => $ticket->status,
                    'new_admin_response' => $ticket->admin_response,
                    'new_admin_feedback' => $ticket->admin_feedback
                ]);
            }

            $message = '';
            if ($request->has('admin_feedback')) {
                $message = 'Admin feedback updated successfully';
            } elseif ($request->has('admin_response')) {
                $message = 'Admin response updated successfully';
            } elseif ($request->has('status')) {
                $message = 'Ticket status updated successfully';
            } else {
                $message = 'Ticket updated successfully';
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => [
                        'id' => $ticket->id,
                        'status' => $ticket->status,
                        'admin_response' => $ticket->admin_response,
                        'admin_feedback' => $ticket->admin_feedback,
                        'resolved_at' => $ticket->resolved_at,
                    ]
                ]);
            }

            // For Inertia requests, redirect back with success message
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error updating support ticket: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update ticket: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Failed to update ticket: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified support ticket.
     */
    public function destroy($id)
    {
        try {
            $ticket = CustomerSupport::findOrFail($id);

            // Delete image if exists
            if ($ticket->image && \Storage::disk('public')->exists($ticket->image)) {
                \Storage::disk('public')->delete($ticket->image);
            }

            $ticket->delete();

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Ticket deleted successfully'
                ]);
            }

            return redirect()->route('customer-support.index')
                ->with('success', 'Ticket deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting support ticket: ' . $e->getMessage());

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete ticket'
                ], 500);
            }

            return back()->with('error', 'Failed to delete ticket');
        }
    }
}
