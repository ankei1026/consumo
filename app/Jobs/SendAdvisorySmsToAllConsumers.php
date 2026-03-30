<?php

namespace App\Jobs;

use App\Models\Consumer;
use App\Http\Controllers\PhilsmsController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAdvisorySmsToAllConsumers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $advisory;

    public function __construct($advisory)
    {
        $this->advisory = $advisory;
    }

    public function handle()
    {
        file_put_contents(storage_path('debug.txt'), "Job started at " . now() . PHP_EOL, FILE_APPEND);

        $consumers = Consumer::whereNotNull('mobile_number')
            ->where('mobile_number', '!=', '')
            ->get();

        $message = "Public Advisory-Consumo Cagwait\n\nTitle: {$this->advisory->title}\n{$this->advisory->description}";
        // Truncate if needed (SMS limit 160 chars)
        $message = substr($message, 0, 160);

        $philSms = new PhilsmsController();

        foreach ($consumers as $consumer) {
            try {
                $philSms->sendSms($consumer->mobile_number, $message);
            } catch (\Exception $e) {
                Log::error("Failed to send SMS to {$consumer->mobile_number}: " . $e->getMessage());
            }
        }
    }
}
