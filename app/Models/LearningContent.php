<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningContent extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'title',
        'content_type',
        'original_filename',
        'file_path',
        'source_url',
        'thumbnail_url',
        'estimated_duration',
        'total_pages',
        'language',
        'ai_analysis',
        'structured_sections',
        'subject_category',
        'subject_icon',
        'subject_color',
        'difficulty',
        'status',
        'error_message',
    ];

    protected $appends = ['quiz_count'];

    protected function casts(): array
    {
        return [
            'ai_analysis' => 'array',
            'structured_sections' => 'array',
            'estimated_duration' => 'integer',
            'total_pages' => 'integer',
        ];
    }

    public function getQuizCountAttribute(): int
    {
        return $this->quizzes()->count();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(LearningSession::class, 'content_id');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'content_id');
    }

    public function knowledgeCards(): HasMany
    {
        return $this->hasMany(KnowledgeCard::class, 'content_id');
    }
}
