<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QuizSession extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'content_id',
        'quiz_id',
        'section_index',
        'section_title',
        'status',
        'current_question_index',
        'correct_count',
        'total_questions',
        'score_percentage',
        'started_at',
        'completed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'section_index' => 'integer',
            'current_question_index' => 'integer',
            'correct_count' => 'integer',
            'total_questions' => 'integer',
            'score_percentage' => 'decimal:2',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'metadata' => 'array',
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

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(QuizResponse::class, 'quiz_session_id');
    }

    public function resultSummary(): HasOne
    {
        return $this->hasOne(QuizResultSummary::class, 'quiz_session_id');
    }
}
