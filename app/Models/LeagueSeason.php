<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeagueSeason extends Model
{
    protected $fillable = ['name', 'starts_at', 'ends_at', 'is_active'];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at'   => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(LeagueBlock::class, 'season_id');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(LeagueMembership::class, 'season_id');
    }

    public static function current(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
