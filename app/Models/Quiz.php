<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'content_id',
        'section_index',
        'questions',
        'question_count',
        'difficulty',
        'time_limit_seconds',
        'pass_threshold',
    ];

    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'question_count' => 'integer',
            'time_limit_seconds' => 'integer',
            'pass_threshold' => 'integer',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'content_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
