<?php
// app/Models/CustomerSupport.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerSupport extends Model
{
    protected $fillable = [
        'consumer_id',
        'subject',
        'message',
        'image',
        'status',
        'admin_response',
        'resolved_at',
        'responded_by',
        'admin_feedback',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    // Subject options constant
    const SUBJECTS = [
        'appreciation' => 'Appreciation',
        'complaint' => 'Complaint',
        'suggestion' => 'Suggestion',
        'inquiry' => 'Inquiry',
        'other' => 'Other'
    ];

    // Status options constant
    const STATUSES = [
        'pending' => 'Pending',
        'in_progress' => 'In Progress',
        'resolved' => 'Resolved',
        'closed' => 'Closed'
    ];

    // Status colors for UI
    const STATUS_COLORS = [
        'pending' => 'warning',
        'in_progress' => 'info',
        'resolved' => 'success',
        'closed' => 'secondary'
    ];

    /**
     * Get the consumer that owns this support ticket
     */
    public function consumer(): BelongsTo
    {
        return $this->belongsTo(Consumer::class, 'consumer_id', 'custcode');
    }

    /**
     * Get formatted subject
     */
    public function getFormattedSubjectAttribute(): string
    {
        return self::SUBJECTS[$this->subject] ?? ucfirst($this->subject);
    }

    /**
     * Get formatted status
     */
    public function getFormattedStatusAttribute(): string
    {
        return self::STATUSES[$this->status] ?? ucfirst($this->status);
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return self::STATUS_COLORS[$this->status] ?? 'secondary';
    }

    /**
     * Get image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }
}
