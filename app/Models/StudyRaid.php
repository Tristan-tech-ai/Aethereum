<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class StudyRaid extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'creator_id',
        'content_id',
        'invite_code',
        'max_participants',
        'duration_minutes',
        'status',
        'team_score',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'team_score' => 'decimal:2',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(LearningContent::class, 'content_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'raid_participants', 'raid_id', 'user_id')
            ->withPivot(['role', 'progress_percentage', 'quiz_score', 'focus_integrity', 'xp_earned', 'coins_earned', 'status', 'joined_at', 'completed_at']);
    }
}
