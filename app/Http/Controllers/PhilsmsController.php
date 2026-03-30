<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PhilsmsController extends Controller
{
    protected $baseUrl = 'https://dashboard.philsms.com/api/v3';
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('PHIL_SMS_API_KEY');
    }

    /**
     * Format a Philippine phone number to international format.
     * Examples:
     *   0924727473 -> 63924727473
     *   63924727473 -> 63924727473 (unchanged)
     *   024727473 -> 63924727473 (if missing leading 9? adjust as needed)
     *
     * @param string $number
     * @return string
     */
    private function formatPhoneNumber(string $number): string
    {
        // Remove all non-digit characters
        $number = preg_replace('/\D/', '', $number);

        // If number starts with '0', remove the leading zero and prepend '63'
        if (strlen($number) > 0 && $number[0] === '0') {
            $number = '63' . substr($number, 1);
        }

        // If number starts with '63', keep as is (already international)
        // If number starts with something else (e.g., '9'), prepend '63'
        if (strlen($number) > 0 && substr($number, 0, 2) !== '63') {
            $number = '63' . $number;
        }

        // Optionally, validate length (Philippine mobile numbers are 12 digits including country code)
        if (strlen($number) !== 12) {
            Log::warning('Phone number after formatting is not 12 digits: ' . $number);
        }

        return $number;
    }

    /**
     * Send a single SMS.
     *
     * @param string $phoneNumber
     * @param string $message
     * @return array
     */
    public function sendSms(string $phoneNumber, string $message): array
    {
        // Format the phone number
        $formattedNumber = $this->formatPhoneNumber($phoneNumber);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/sms/send', [
                'recipient' => $formattedNumber,
                'message' => $message,
                'sender_id' => 'PhilSMS',
            ]);

            if ($response->failed()) {
                $error = $response->json('message') ?? 'SMS sending failed';
                throw new \Exception($error);
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('SMS sending error: ' . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
