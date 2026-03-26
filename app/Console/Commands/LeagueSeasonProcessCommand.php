<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\LeagueController;
use App\Models\LeagueBlock;
use App\Models\LeagueMembership;
use App\Models\LeagueSeason;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LeagueSeasonProcessCommand extends Command
{
    protected $signature = 'league:process-season';
    protected $description = 'End the current league season: promote top 10, demote bottom 20, create next season.';

    public function handle(): int
    {
        $season = LeagueSeason::current();

        if (! $season) {
            $this->warn('No active season found. Creating initial season…');
            $this->createSeason();
            return self::SUCCESS;
        }

        if (now()->lt($season->ends_at)) {
            $this->info("Season \"{$season->name}\" has not ended yet (ends {$season->ends_at}).");
            return self::SUCCESS;
        }

        // ── Process all blocks in current season ──────────────
        $blocks = LeagueBlock::where('season_id', $season->id)->get();
        $tiers  = LeagueController::TIERS;
        $promoTop   = LeagueController::PROMOTION_TOP;
        $demoteFrom = LeagueController::BLOCK_SIZE - LeagueController::DEMOTION_BOTTOM + 1;

        $promotions = [];
        $demotions  = [];
        $stays      = [];

        foreach ($blocks as $block) {
            $members = LeagueMembership::where('block_id', $block->id)
                ->orderByDesc('xp_earned')
                ->get();

            $tierIdx = array_search($block->tier, $tiers);

            foreach ($members->values() as $i => $m) {
                $rank = $i + 1;

                if ($rank <= $promoTop && $tierIdx < count($tiers) - 1) {
                    $promotions[] = ['user_id' => $m->user_id, 'tier' => $tiers[$tierIdx + 1]];
                } elseif ($rank >= $demoteFrom && $tierIdx > 0) {
                    $demotions[] = ['user_id' => $m->user_id, 'tier' => $tiers[$tierIdx - 1]];
                } else {
                    $stays[] = ['user_id' => $m->user_id, 'tier' => $block->tier];
                }
            }
        }

        // ── Close current season ──────────────────────────────
        $season->update(['is_active' => false]);

        // ── Create next season ────────────────────────────────
        $newSeason = $this->createSeason();

        $this->info("New season \"{$newSeason->name}\" created.");

        // ── Place users in new season ─────────────────────────
        $controller = app(LeagueController::class);
        $allPlacements = array_merge($promotions, $demotions, $stays);

        foreach ($allPlacements as $p) {
            $controller->assignToBlock($p['user_id'], $newSeason, $p['tier']);
        }

        $this->info(sprintf(
            'Processed %d users: %d promoted, %d demoted, %d stayed.',
            count($allPlacements),
            count($promotions),
            count($demotions),
            count($stays),
        ));

        return self::SUCCESS;
    }

    private function createSeason(): LeagueSeason
    {
        $now = now();
        $name = 'Season ' . $now->format('Y-W');

        return LeagueSeason::create([
            'name'      => $name,
            'starts_at' => $now,
            'ends_at'   => $now->copy()->addWeek(),
            'is_active' => true,
        ]);
    }
}
