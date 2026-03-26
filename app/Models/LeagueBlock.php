<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeagueBlock extends Model
{
    protected $fillable = ['season_id', 'tier'];

    public function season(): BelongsTo
    {
        return $this->belongsTo(LeagueSeason::class, 'season_id');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(LeagueMembership::class, 'block_id');
    }
}
