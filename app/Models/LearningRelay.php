<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningRelay extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'creator_id',
        'content_id',
        'invite_code',
        'max_participants',
        'status',
        'combined_summary',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
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
        return $this->belongsToMany(User::class, 'relay_participants', 'relay_id', 'user_id')
            ->withPivot(['section_index', 'section_content', 'section_summary', 'section_completed', 'quiz_score', 'xp_earned', 'coins_earned']);
    }
}
