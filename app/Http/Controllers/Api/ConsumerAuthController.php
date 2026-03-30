<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log; // ADD THIS LINE

class ConsumerAuthController extends Controller
{
    /**
     * Login consumer using meter number and account number
     */
    public function login(Request $request)
    {
        try {
            Log::info('=== LOGIN START ===');

            $validator = Validator::make($request->all(), [
                'meter_number' => 'required|string',
                'account_number' => 'required|string',
                'device_name' => 'sometimes|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $consumer = Consumer::where('meter_number', $request->meter_number)
                ->where('account_number', $request->account_number)
                ->first();

            if (!$consumer) {
                Log::warning('Login failed: Consumer not found');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid meter number or account number'
                ], 401);
            }

            if ($consumer->status !== 'active') {
                Log::warning('Login failed: Account inactive for consumer: ' . $consumer->custcode);
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is inactive. Please contact support.'
                ], 403);
            }

            $deviceName = $request->device_name ?? 'flutter_app';
            $token = $consumer->createToken($deviceName)->plainTextToken;

            Log::info('Login successful for consumer: ' . $consumer->custcode);
            Log::info('=== LOGIN END ===');

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'token' => $token,
                    'consumer' => [
                        'custcode' => $consumer->custcode,
                        'name' => $consumer->name,
                        'account_number' => $consumer->account_number,
                        'meter_number' => $consumer->meter_number,
                        'mobile_number' => $consumer->mobile_number,
                        'address' => $consumer->address,
                        'connection_type' => $consumer->connection_type,
                        'status' => $consumer->status,
                        'created_at' => $consumer->created_at,
                        'updated_at' => $consumer->updated_at,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get consumer profile
     */
    public function profile()
    {
        try {
            Log::info('=== PROFILE FETCH START ===');

            if (!Auth::check()) {
                Log::error('User not authenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $consumer = Auth::user();
            Log::info('Fetching profile for consumer: ' . $consumer->custcode);
            Log::info('=== PROFILE FETCH END ===');

            return response()->json([
                'success' => true,
                'data' => [
                    'consumer' => [
                        'custcode' => $consumer->custcode,
                        'name' => $consumer->name,
                        'account_number' => $consumer->account_number,
                        'meter_number' => $consumer->meter_number,
                        'mobile_number' => $consumer->mobile_number,
                        'address' => $consumer->address,
                        'connection_type' => $consumer->connection_type,
                        'status' => $consumer->status,
                        'created_at' => $consumer->created_at,
                        'updated_at' => $consumer->updated_at,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Profile error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update consumer profile (address and mobile number only)
     */
    public function updateProfile(Request $request)
    {
        try {
            Log::info('=== UPDATE PROFILE START ===');

            $consumer = Auth::user();

            $validator = Validator::make($request->all(), [
                'mobile_number' => 'sometimes|string|unique:consumers,mobile_number,' . $consumer->custcode . ',custcode',
                'address' => 'sometimes|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->has('mobile_number')) {
                $consumer->mobile_number = $request->mobile_number;
            }

            if ($request->has('address')) {
                $consumer->address = $request->address;
            }

            $consumer->save();

            Log::info('Profile updated for consumer: ' . $consumer->custcode);
            Log::info('=== UPDATE PROFILE END ===');

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'consumer' => [
                        'custcode' => $consumer->custcode,
                        'name' => $consumer->name,
                        'account_number' => $consumer->account_number,
                        'meter_number' => $consumer->meter_number,
                        'mobile_number' => $consumer->mobile_number,
                        'address' => $consumer->address,
                        'connection_type' => $consumer->connection_type,
                        'status' => $consumer->status,
                        'created_at' => $consumer->created_at,
                        'updated_at' => $consumer->updated_at,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout consumer
     */
    public function logout(Request $request)
    {
        try {
            Log::info('=== LOGOUT START ===');

            if (Auth::check()) {
                $consumer = Auth::user();
                Log::info('Logging out consumer: ' . $consumer->custcode);

                // Revoke the token that was used to authenticate the current request
                $request->user()->currentAccessToken()->delete();

                Log::info('Logout successful');
            }

            Log::info('=== LOGOUT END ===');

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to logout: ' . $e->getMessage()
            ], 500);
        }
    }
}
