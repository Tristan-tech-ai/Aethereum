<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class QuizArena extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'host_id',
        'content_id',
        'room_code',
        'max_players',
        'question_count',
        'time_per_question',
        'status',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'content_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'arena_participants', 'arena_id', 'user_id')
            ->withPivot(['total_score', 'correct_answers', 'final_rank', 'xp_earned', 'coins_earned']);
    }
}
