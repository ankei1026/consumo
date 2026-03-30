<?php
// app/Models/PublicAdvisory.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublicAdvisory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'type',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'formatted_date',
        'type_color',
        'status_color',
    ];

    /**
     * Get the type badge color.
     */
    public function getTypeColorAttribute(): string
    {
        return match($this->type) {
            'emergency' => 'red',
            'maintenance' => 'yellow',
            'general' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get the status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'done' => 'green',
            'on-going' => 'blue',
            'upcoming' => 'yellow',
            default => 'gray',
        };
    }

    /**
     * Get the formatted created date.
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->created_at->format('F j, Y');
    }

    /**
     * Scope a query to only include emergency advisories.
     */
    public function scopeEmergency($query)
    {
        return $query->where('type', 'emergency');
    }

    /**
     * Scope a query to only include maintenance advisories.
     */
    public function scopeMaintenance($query)
    {
        return $query->where('type', 'maintenance');
    }

    /**
     * Scope a query to only include general advisories.
     */
    public function scopeGeneral($query)
    {
        return $query->where('type', 'general');
    }

    /**
     * Scope a query by status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
