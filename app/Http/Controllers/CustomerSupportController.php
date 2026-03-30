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
                $query->where(function($q) use ($search) {
                    $q->whereHas('consumer', function($cq) use ($search) {
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
                    'created_at' => $ticket->created_at,
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
                'created_at' => $ticket->created_at,
                'consumer' => $ticket->consumer ? [
                    'name' => $ticket->consumer->name,
                    'account_number' => $ticket->consumer->account_number,
                    'meter_number' => $ticket->consumer->meter_number,
                    'mobile_number' => $ticket->consumer->mobile_number,
                    'address' => $ticket->consumer->address,
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

            $validated = $request->validate([
                'admin_response' => 'nullable|string',
                'status' => 'required|in:pending,in_progress,resolved,closed',
            ]);

            $ticket->update([
                'admin_response' => $validated['admin_response'],
                'status' => $validated['status'],
                'resolved_at' => $validated['status'] === 'resolved' ? now() : $ticket->resolved_at,
            ]);

            return redirect()->back()->with('success', 'Ticket updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating support ticket: ' . $e->getMessage());

            return back()->with('error', 'Failed to update ticket');
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

            return redirect()->route('customer-support.index')
                ->with('success', 'Ticket deleted successfully');

        } catch (\Exception $e) {
            Log::error('Error deleting support ticket: ' . $e->getMessage());

            return back()->with('error', 'Failed to delete ticket');
        }
    }
}
