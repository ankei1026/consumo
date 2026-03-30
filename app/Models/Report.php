<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'custcode',
        'image',
        'content',
        'water_consumption_id',
    ];

    /**
     * Get the consumer that owns the report.
     */
    public function consumer()
    {
        return $this->belongsTo(Consumer::class, 'custcode', 'custcode');
    }

    /**
     * Get the water consumption record associated with this report.
     */
    public function waterConsumption()
    {
        return $this->belongsTo(WaterConsumption::class, 'water_consumption_id');
    }

    /**
     * Get the AI response for this report.
     */
    public function aiResponse()
    {
        return $this->hasOne(MultimodalAiResponse::class);
    }

    /**
     * Scope a query to get reports for a specific consumer.
     */
    public function scopeForConsumer($query, $custcode)
    {
        return $query->where('custcode', $custcode);
    }

}
