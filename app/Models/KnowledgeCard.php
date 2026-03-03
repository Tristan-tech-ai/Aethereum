<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeCard extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'content_id',
        'session_id',
        'title',
        'subject_category',
        'subject_icon',
        'subject_color',
        'mastery_percentage',
        'quiz_avg_score',
        'focus_integrity',
        'time_invested',
        'tier',
        'summary_snippet',
        'keywords',
        'is_pinned',
        'is_public',
        'likes',
        'is_collaborative',
        'collaborators',
        'last_reviewed_at',
        'integrity_decay_rate',
    ];

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'collaborators' => 'array',
            'mastery_percentage' => 'integer',
            'quiz_avg_score' => 'decimal:2',
            'focus_integrity' => 'decimal:2',
            'is_pinned' => 'boolean',
            'is_public' => 'boolean',
            'is_collaborative' => 'boolean',
            'last_reviewed_at' => 'datetime',
            'integrity_decay_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'content_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(LearningSession::class, 'session_id');
    }

    /**
     * Determine card tier from mastery percentage.
     */
    public static function tierFromMastery(int $mastery): string
    {
        return match (true) {
            $mastery >= 100 => 'Diamond',
            $mastery >= 90  => 'Gold',
            $mastery >= 80  => 'Silver',
            default         => 'Bronze',
        };
    }
}
