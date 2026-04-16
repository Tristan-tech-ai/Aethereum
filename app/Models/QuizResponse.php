<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizResponse extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'quiz_session_id',
        'question_index',
        'selected_index',
        'is_correct',
        'time_taken_ms',
        'answered_at',
    ];

    protected function casts(): array
    {
        return [
            'question_index' => 'integer',
            'selected_index' => 'integer',
            'is_correct' => 'boolean',
            'time_taken_ms' => 'integer',
            'answered_at' => 'datetime',
        ];
    }

    public function quizSession(): BelongsTo
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }
}
