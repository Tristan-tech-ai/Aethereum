<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class StudyRoom extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'creator_id',
        'name',
        'description',
        'room_code',
        'is_public',
        'max_capacity',
        'music_preset',
        'status',
        'current_pomodoro_phase',
        'pomodoro_started_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'pomodoro_started_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'study_room_members', 'room_id', 'user_id')
            ->withPivot(['is_online', 'current_material', 'joined_at', 'last_active_at', 'xp_earned']);
    }
}
