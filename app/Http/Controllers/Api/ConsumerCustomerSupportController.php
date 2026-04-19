<?php
// app/Http/Controllers/Api/ConsumerCustomerSupportController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerSupport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ConsumerCustomerSupportController extends Controller
{
    /**
     * Get all support tickets for authenticated consumer
     */
    public function index(Request $request)
    {
        try {
            $consumer = Auth::user();

            $tickets = CustomerSupport::where('consumer_id', $consumer->custcode)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => [
                    'tickets' => $tickets->map(function ($ticket) {
                        return $this->formatTicket($ticket);
                    }),
                    'pagination' => [
                        'current_page' => $tickets->currentPage(),
                        'last_page' => $tickets->lastPage(),
                        'per_page' => $tickets->perPage(),
                        'total' => $tickets->total()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching support tickets: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch support tickets'
            ], 500);
        }
    }

    /**
     * Create a new support ticket
     */
    public function store(Request $request)
    {
        try {
            $consumer = Auth::user();

            $validator = Validator::make($request->all(), [
                'subject' => 'required|in:appreciation,complaint,suggestion,inquiry,other',
                'message' => 'required|string|min:10|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('customer_support', 'public');
            }

            $ticket = CustomerSupport::create([
                'consumer_id' => $consumer->custcode,
                'subject' => $request->subject,
                'message' => $request->message,
                'image' => $imagePath,
                'status' => 'pending'
            ]);

            $admins = User::where('role', 'admin')->get();

            Notification::send($admins, new \App\Notifications\ConsumerCustomerSupporttNotification($ticket));

            return response()->json([
                'success' => true,
                'message' => 'Support ticket submitted successfully',
                'data' => [
                    'ticket' => $this->formatTicket($ticket)
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating support ticket: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit support ticket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific support ticket
     */
    public function show($id)
    {
        try {
            $consumer = Auth::user();

            $ticket = CustomerSupport::where('id', $id)
                ->where('consumer_id', $consumer->custcode)
                ->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'ticket' => $this->formatTicket($ticket)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch ticket'
            ], 500);
        }
    }

    /**
     * Format ticket data for API response
     */
    private function formatTicket($ticket)
    {
        return [
            'id' => $ticket->id,
            'consumer_id' => $ticket->consumer_id,
            'subject' => $ticket->subject,
            'formatted_subject' => $ticket->formatted_subject,
            'message' => $ticket->message,
            'image' => $ticket->image ? asset('storage/' . $ticket->image) : null,
            'status' => $ticket->status ?? 'pending',
            'admin_feedback' => $ticket->admin_feedback,
            'created_at' => $ticket->created_at->toISOString(),
            'updated_at' => $ticket->updated_at->toISOString(),
            'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->toISOString() : null,
        ];
    }
}
