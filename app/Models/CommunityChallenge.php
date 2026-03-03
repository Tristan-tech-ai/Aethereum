<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CommunityChallenge extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title',
        'description',
        'challenge_type',
        'subject_filter',
        'goal_value',
        'starts_at',
        'ends_at',
        'current_value',
        'is_completed',
        'completed_at',
        'reward_coins',
        'reward_badge_id',
        'reward_frame',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'completed_at' => 'datetime',
            'is_completed' => 'boolean',
        ];
    }

    public function contributors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'challenge_contributions', 'challenge_id', 'user_id')
            ->withPivot(['contribution_value', 'reward_claimed']);
    }
}
