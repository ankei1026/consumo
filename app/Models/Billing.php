<?php
// app/Models/Billing.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custcode',
        'bill_number',
        'reading_date',
        'current_reading',
        'previous_reading',
        'consumption',
        'current_due',
        'arrears',
        'total_amount_due',
        'due_date',
        'penalty',
        'total_amount_after_due',
        'installation_balance',
        'miscellaneous_balance',
        'notes',
        'payment_status',
        'payment_date',
        'payment_reference',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reading_date' => 'date',
        'due_date' => 'date',
        'payment_date' => 'date',
        'current_reading' => 'integer',
        'previous_reading' => 'integer',
        'consumption' => 'integer',
        'current_due' => 'decimal:2',
        'arrears' => 'decimal:2',
        'total_amount_due' => 'decimal:2',
        'penalty' => 'decimal:2',
        'total_amount_after_due' => 'decimal:2',
        'installation_balance' => 'decimal:2',
        'miscellaneous_balance' => 'decimal:2',
    ];

    /**
     * Get the consumer that owns the billing.
     */
    public function consumer()
    {
        return $this->belongsTo(Consumer::class, 'custcode', 'custcode');
    }

    /**
     * Generate a unique bill number
     * Format: B + Date(YYYYMMDD) + Sequence
     * Example: B0041022026135
     */
    public static function generateBillNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = 'B' . $date;

        // Get the last bill number for today
        $lastBill = self::where('bill_number', 'like', $prefix . '%')
            ->orderBy('bill_number', 'desc')
            ->first();

        if (!$lastBill) {
            $sequence = '001';
        } else {
            $lastSequence = (int) substr($lastBill->bill_number, -3);
            $sequence = str_pad($lastSequence + 1, 3, '0', STR_PAD_LEFT);
        }

        return $prefix . $sequence;
    }

    /**
     * Calculate total amount due
     */
    public function calculateTotalDue(): void
    {
        $this->total_amount_due = $this->current_due + $this->arrears;

        // Check if overdue and calculate penalty
        if (now()->greaterThan($this->due_date) && $this->payment_status === 'unpaid') {
            $this->payment_status = 'overdue';
            $this->total_amount_after_due = $this->total_amount_due + $this->penalty;
        } else {
            $this->total_amount_after_due = $this->total_amount_due;
        }
    }

    /**
     * Calculate consumption
     */
    public function calculateConsumption(): void
    {
        $this->consumption = $this->current_reading - $this->previous_reading;
    }

    /**
     * Scope for unpaid bills
     */
    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', 'unpaid');
    }

    /**
     * Scope for overdue bills
     */
    public function scopeOverdue($query)
    {
        return $query->where('payment_status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('payment_status', 'unpaid')
                    ->where('due_date', '<', now());
            });
    }

    /**
     * Scope for bills by consumer
     */
    public function scopeForConsumer($query, $custcode)
    {
        return $query->where('custcode', $custcode);
    }

    // app/Models/Billing.php

    public function calculateCurrentDue(string $type): float
    {
        $consumption = $this->consumption;
        $amount = 0;

        // Defined rates based on the ordinance images
        $rates = [
            'Residential' => [
                'min' => 160.00,
                'tiers' => [
                    ['limit' => 20, 'rate' => 18.00],
                    ['limit' => 30, 'rate' => 20.50],
                    ['limit' => PHP_INT_MAX, 'rate' => 23.50],
                ]
            ],
            'Commercial B' => [
                'min' => 280.00,
                'tiers' => [
                    ['limit' => 20, 'rate' => 30.00],
                    ['limit' => 30, 'rate' => 32.50],
                    ['limit' => PHP_INT_MAX, 'rate' => 35.50],
                ]
            ],
            // Add Commercial A, C, and Industrial based on Page 6 & 7 of your upload
        ];

        if (!isset($rates[$type])) {
            return 0;
        }

        $config = $rates[$type];

        // SECTION 11: Minimum charge for first 10 cu.m.
        $amount = $config['min'];

        // SECTION 11.A.2: Charges for consumption > 10 cu.m.
        if ($consumption > 10) {
            $excess = $consumption - 10;

            foreach ($config['tiers'] as $tier) {
                $tierLimit = $tier['limit'] - 10; // Adjust limit because first 10 is base
                $prevLimit = isset($lastLimit) ? $lastLimit : 0;

                $billableInThisTier = min($excess, $tierLimit) - $prevLimit;

                if ($billableInThisTier > 0) {
                    $amount += $billableInThisTier * $tier['rate'];
                }

                if ($excess <= $tierLimit) break;
                $lastLimit = $tierLimit;
            }
        }

        $this->current_due = $amount;
        return $amount;
    }
}
