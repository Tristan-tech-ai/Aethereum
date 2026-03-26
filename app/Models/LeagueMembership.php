<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeagueMembership extends Model
{
    protected $fillable = ['user_id', 'block_id', 'season_id', 'xp_earned'];

    protected function casts(): array
    {
        return [
            'xp_earned' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function block(): BelongsTo
    {
        return $this->belongsTo(LeagueBlock::class, 'block_id');
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(LeagueSeason::class, 'season_id');
    }
}
