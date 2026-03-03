<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'session_id',
        'answers',
        'correct_count',
        'total_questions',
        'score_percentage',
        'passed',
        'time_taken_seconds',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'score_percentage' => 'decimal:2',
            'passed' => 'boolean',
        ];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(LearningSession::class, 'session_id');
    }
}
