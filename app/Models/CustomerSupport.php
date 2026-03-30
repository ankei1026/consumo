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
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Subject options constant
    const SUBJECTS = [
        'appreciation' => 'Appreciation',
        'complaint' => 'Complaint',
        'suggestion' => 'Suggestion',
        'inquiry' => 'Inquiry',
        'other' => 'Other'
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
