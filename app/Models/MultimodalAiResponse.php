<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MultimodalAiResponse extends Model
{
    protected $fillable = [
        'report_id',
        'leak_detected',
        'leak_type',
        'severity',
        'priority',
        'image_analysis',
        'recommendation',
        'summary',
        'text_consistency',
        'consumption_analysis',
        'trend_analysis',
        'raw_response',
        'tokens_used',
        'input_tokens',
        'output_tokens',
        'estimated_cost',
        'cache_key',
        'image_hash',
        'report_content_hash',
        'consumption_hash',
        'analysis_version',
        'analyzed_at',
        'expires_at',
        'is_cached'
    ];

    protected $casts = [
        'leak_detected' => 'boolean',
        'text_consistency' => 'array',
        'consumption_analysis' => 'array',
        'trend_analysis' => 'array',
        'raw_response' => 'array',
        'estimated_cost' => 'decimal:8',
        'analyzed_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_cached' => 'boolean'
    ];

    /**
     * Get the report that owns the AI response
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * Check if the response is still valid (not expired)
     */
    public function isValid(): bool
    {
        if (!$this->expires_at) {
            return true;
        }

        return $this->expires_at->isFuture();
    }

    /**
     * Calculate total cost in a readable format
     */
    public function getFormattedCostAttribute(): string
    {
        if (!$this->estimated_cost) {
            return 'N/A';
        }

        return '$' . number_format($this->estimated_cost, 8);
    }

    /**
     * Scope for active/unexpired responses
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Scope for leak detection
     */
    public function scopeWithLeak($query, bool $detected = true)
    {
        return $query->where('leak_detected', $detected);
    }

    /**
     * Scope by severity
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }
}
