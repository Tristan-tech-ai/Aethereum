<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizResultSummary extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'quiz_session_id',
        'summary_text',
        'correct_count',
        'total_questions',
        'score_percentage',
        'passed',
    ];

    protected function casts(): array
    {
        return [
            'correct_count' => 'integer',
            'total_questions' => 'integer',
            'score_percentage' => 'decimal:2',
            'passed' => 'boolean',
        ];
    }

    public function quizSession(): BelongsTo
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }
}
