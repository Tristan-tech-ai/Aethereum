<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningSession extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'content_id',
        'flow_type',
        'current_section',
        'total_sections',
        'started_at',
        'completed_at',
        'total_focus_time',
        'total_break_time',
        'focus_integrity',
        'tab_switches',
        'distraction_count',
        'quiz_avg_score',
        'quiz_attempts_total',
        'quiz_passes',
        'user_summary',
        'summary_score',
        'xp_earned',
        'coins_earned',
        'status',
        'progress_data',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'focus_integrity' => 'decimal:2',
            'quiz_avg_score' => 'decimal:2',
            'summary_score' => 'decimal:2',
            'progress_data' => 'array',
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

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'session_id');
    }

    public function knowledgeCard(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(KnowledgeCard::class, 'session_id');
    }
}
