<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'custcode',
        'image',
        'content',
        'water_consumption_id',
        'status',
        'admin_feedback',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_REJECTED = 'rejected';

    // Status colors for UI
    const STATUS_COLORS = [
        'pending' => 'warning',
        'ongoing' => 'info',
        'resolved' => 'success',
        'rejected' => 'danger'
    ];

    // Status labels for UI
    const STATUS_LABELS = [
        'pending' => 'Pending',
        'ongoing' => 'In Progress',
        'resolved' => 'Resolved',
        'rejected' => 'Rejected'
    ];

    /**
     * Get the consumer that owns the report.
     */
    public function consumer()
    {
        return $this->belongsTo(Consumer::class, 'custcode', 'custcode');
    }

    /**
     * Get the water consumption record associated with the report.
     */
    public function waterConsumption()
    {
        return $this->belongsTo(WaterConsumption::class);
    }

    /**
     * Get the AI response for the report.
     */
    public function aiResponse()
    {
        return $this->hasOne(MultimodalAiResponse::class);
    }

    /**
     * Get the user who resolved the report.
     */
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope for pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for ongoing reports
     */
    public function scopeOngoing($query)
    {
        return $query->where('status', self::STATUS_ONGOING);
    }

    /**
     * Scope for resolved reports
     */
    public function scopeResolved($query)
    {
        return $query->where('status', self::STATUS_RESOLVED);
    }

    /**
     * Check if report is resolved
     */
    public function isResolved()
    {
        return in_array($this->status, [self::STATUS_RESOLVED, self::STATUS_REJECTED]);
    }

    /**
     * Mark report as resolved
     */
    public function markAsResolved($userId = null, $notes = null)
    {
        $this->update([
            'status' => self::STATUS_RESOLVED,
            'resolved_at' => now(),
            'resolved_by' => $userId,
            'resolution_notes' => $notes
        ]);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return self::STATUS_COLORS[$this->status] ?? 'secondary';
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return self::STATUS_LABELS[$this->status] ?? ucfirst($this->status);
    }
}
