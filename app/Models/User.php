<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasUuids, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'avatar_url',
        'bio',
        'xp',
        'level',
        'rank',
        'current_streak',
        'longest_streak',
        'streak_freeze_available',
        'last_learning_date',
        'weekly_goal',
        'total_xp_ever',
        'total_learning_hours',
        'total_sessions',
        'total_knowledge_cards',
        'is_profile_public',
        'show_on_leaderboard',
        'google_id',
        'supabase_id',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'google_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_learning_date' => 'date',
            'last_login_at' => 'datetime',
            'streak_freeze_available' => 'boolean',
            'is_profile_public' => 'boolean',
            'show_on_leaderboard' => 'boolean',
            'xp' => 'integer',
            'level' => 'integer',
        ];
    }

    // ─── Relationships ───

    public function wallet(): HasOne
    {
        return $this->hasOne(UserWallet::class);
    }

    public function learningContents(): HasMany
    {
        return $this->hasMany(LearningContent::class);
    }

    public function learningSessions(): HasMany
    {
        return $this->hasMany(LearningSession::class);
    }

    public function knowledgeCards(): HasMany
    {
        return $this->hasMany(KnowledgeCard::class);
    }

    public function xpEvents(): HasMany
    {
        return $this->hasMany(XpEvent::class);
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function feedEvents(): HasMany
    {
        return $this->hasMany(FeedEvent::class);
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'addressee_id');
    }

    public function createdRaids(): HasMany
    {
        return $this->hasMany(StudyRaid::class, 'creator_id');
    }

    public function createdRooms(): HasMany
    {
        return $this->hasMany(StudyRoom::class, 'creator_id');
    }

    // ─── Helpers ───

    public function pinnedCards(): HasMany
    {
        return $this->knowledgeCards()->where('is_pinned', true);
    }

    public function featuredAchievements(): HasMany
    {
        return $this->achievements()->where('is_featured', true);
    }

    /**
     * Calculate XP needed for a given level.
     * Formula: round(100 * (level^1.5))
     */
    public static function xpNeededForLevel(int $level): int
    {
        return (int) round(100 * pow($level, 1.5));
    }

    /**
     * Get XP remaining to reach next level.
     */
    public function xpToNextLevel(): int
    {
        return max(0, self::xpNeededForLevel($this->level + 1) - $this->total_xp_ever);
    }

    /**
     * Determine rank from level.
     */
    public static function rankForLevel(int $level): string
    {
        return match (true) {
            $level >= 76 => 'Diamond',
            $level >= 51 => 'Emerald',
            $level >= 31 => 'Platinum',
            $level >= 16 => 'Gold',
            $level >= 6  => 'Silver',
            default      => 'Bronze',
        };
    }
}
