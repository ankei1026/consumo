<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterConsumption extends Model
{
    protected $fillable = [
        'custcode',
        'current_reading',
        'previous_reading',
        'consumption',
        'reading_date',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reading_date' => 'date',
    ];

    /**
     * Get the consumer that owns this water consumption record.
     */
    public function consumer()
    {
        return $this->belongsTo(Consumer::class, 'custcode', 'custcode');
    }

    /**
     * Get the reports for this water consumption record.
     */
    public function reports()
    {
        return $this->hasMany(Report::class, 'water_consumption_id');
    }

    /**
     * Calculate consumption automatically from readings.
     */
    public static function calculateConsumption($currentReading, $previousReading)
    {
        return $currentReading - $previousReading;
    }

    /**
     * Scope to get consumption records for a specific consumer.
     */
    public function scopeForConsumer($query, $custcode)
    {
        return $query->where('custcode', $custcode);
    }

    /**
     * Scope to get consumption records for a specific date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('reading_date', [$startDate, $endDate]);
    }

    /**
     * Get the formatted consumption with unit.
     */
    public function getFormattedConsumptionAttribute()
    {
        return $this->consumption . ' m³';
    }

    /**
     * Get the billing period display.
     */
    public function getBillingPeriodAttribute()
    {
        return $this->start_date->format('M d, Y') . ' - ' . $this->end_date->format('M d, Y');
    }
}
