<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeagueBlock;
use App\Models\LeagueMembership;
use App\Models\LeagueSeason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeagueController extends Controller
{
    /**
     * Tiers ordered from lowest to highest.
     */
    public const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond'];

    public const BLOCK_SIZE       = 50;
    public const PROMOTION_TOP    = 10;  // top 10 → promote
    public const DEMOTION_BOTTOM  = 20;  // bottom 20 (ranks 31-50) → demote
    // Middle 20 (ranks 11-30) → stay

    // ────────────────────────────────────────────────────────────
    // GET /v1/league — current user's league block + standings
    // ────────────────────────────────────────────────────────────
    public function show(Request $request): JsonResponse
    {
        $user   = $request->user();
        $season = LeagueSeason::current();

        if (! $season) {
            return response()->json([
                'season'  => null,
                'message' => 'No active league season.',
            ]);
        }

        // Ensure user has a membership (auto-join Bronze block)
        $membership = LeagueMembership::where('user_id', $user->id)
            ->where('season_id', $season->id)
            ->first();

        if (! $membership) {
            $membership = $this->assignToBlock($user->id, $season, 'Bronze');
        }

        $block = $membership->block;

        // Fetch all members in same block, ranked by xp_earned DESC
        $standings = LeagueMembership::where('block_id', $block->id)
            ->join('users', 'users.id', '=', 'league_memberships.user_id')
            ->orderByDesc('league_memberships.xp_earned')
            ->select([
                'league_memberships.user_id',
                'league_memberships.xp_earned',
                'users.username',
                'users.name',
                'users.avatar_url',
                'users.level',
            ])
            ->get()
            ->values();

        // Find current user's rank
        $myRank = $standings->search(fn ($row) => $row->user_id === $user->id);
        $myRank = $myRank !== false ? $myRank + 1 : null;

        $tierIndex = array_search($block->tier, self::TIERS);

        return response()->json([
            'season' => [
                'id'        => $season->id,
                'name'      => $season->name,
                'starts_at' => $season->starts_at->toIso8601String(),
                'ends_at'   => $season->ends_at->toIso8601String(),
            ],
            'tier'      => $block->tier,
            'block_id'  => $block->id,
            'my_rank'   => $myRank,
            'my_xp'     => $membership->xp_earned,
            'standings'  => $standings,
            'zones'     => [
                'promotion'  => self::PROMOTION_TOP,
                'safe'       => self::BLOCK_SIZE - self::DEMOTION_BOTTOM,
                'demotion'   => self::BLOCK_SIZE,
            ],
            'can_promote' => $tierIndex < count(self::TIERS) - 1,
            'can_demote'  => $tierIndex > 0,
        ]);
    }

    // ────────────────────────────────────────────────────────────
    // Assign a user to a block in a tier (find one with <50 or create)
    // ────────────────────────────────────────────────────────────
    public function assignToBlock(string $userId, LeagueSeason $season, string $tier): LeagueMembership
    {
        return DB::transaction(function () use ($userId, $season, $tier) {
            // Find a block with fewer than BLOCK_SIZE members
            $block = LeagueBlock::where('season_id', $season->id)
                ->where('tier', $tier)
                ->withCount('memberships')
                ->having('memberships_count', '<', self::BLOCK_SIZE)
                ->first();

            if (! $block) {
                $block = LeagueBlock::create([
                    'season_id' => $season->id,
                    'tier'      => $tier,
                ]);
            }

            return LeagueMembership::create([
                'user_id'   => $userId,
                'block_id'  => $block->id,
                'season_id' => $season->id,
                'xp_earned' => 0,
            ]);
        });
    }
}
