<?php

namespace App\Services;

use App\Models\LearningSession;
use App\Models\User;
use App\Models\XpEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KnowledgeProfileService
{
    // ─── XP per activity ───
    private const XP_SECTION_COMPLETE = 20;
    private const XP_QUIZ_PASS        = 30;
    private const XP_QUIZ_PERFECT     = 50;  // Replaces XP_QUIZ_PASS on 100%
    private const XP_SUMMARY          = 25;
    private const XP_FOCUS_BONUS      = 15;  // Focus integrity ≥ 90%
    private const XP_FULL_MATERIAL    = 100; // Completing all sections

    // ─── Rank thresholds (level → rank) ───
    private const RANKS = [
        76 => 'Sage',
        51 => 'Expert',
        31 => 'Researcher',
        16 => 'Scholar',
        6  => 'Learner',
        1  => 'Seedling',
    ];

    // ─────────────────────────────────────────────────────────────
    // Session XP Award
    // ─────────────────────────────────────────────────────────────

    /**
     * Calculate and award XP for a completed session.
     * Returns breakdown + whether level/rank changed.
     */
    public function awardSessionXP(LearningSession $session, User $user): array
    {
        $breakdown  = [];
        $totalXp    = 0;

        $sectionsCompleted = count($session->progress_data['sections_completed'] ?? []);
        $quizAvg           = (float) ($session->quiz_avg_score ?? 0);
        $quizPasses        = (int) ($session->quiz_passes ?? 0);
        $focusIntegrity    = (float) ($session->focus_integrity ?? 0);
        $summaryScore      = (float) ($session->summary_score ?? 0);
        $totalSections     = (int) ($session->total_sections ?? 0);

        // Sections completed
        if ($sectionsCompleted > 0) {
            $xp = $sectionsCompleted * self::XP_SECTION_COMPLETE;
            $breakdown[] = [
                'label' => "Sections selesai ({$sectionsCompleted})",
                'xp'    => $xp,
            ];
            $totalXp += $xp;
        }

        // Quiz performance
        if ($quizPasses > 0) {
            $xp = $quizAvg >= 100
                ? self::XP_QUIZ_PERFECT
                : self::XP_QUIZ_PASS;
            $label = $quizAvg >= 100 ? 'Quiz sempurna (100%)' : "Quiz lulus ({$quizAvg}%)";
            $breakdown[] = ['label' => $label, 'xp' => $xp];
            $totalXp += $xp;
        }

        // Summary
        if ($summaryScore >= 60) {
            $breakdown[] = ['label' => 'Ringkasan disetujui', 'xp' => self::XP_SUMMARY];
            $totalXp += self::XP_SUMMARY;
        }

        // Focus bonus
        if ($focusIntegrity >= 90) {
            $breakdown[] = ['label' => 'Fokus tinggi (≥90%)', 'xp' => self::XP_FOCUS_BONUS];
            $totalXp += self::XP_FOCUS_BONUS;
        }

        // Full material completion bonus
        if ($totalSections > 0 && $sectionsCompleted >= $totalSections) {
            $breakdown[] = ['label' => 'Materi selesai penuh', 'xp' => self::XP_FULL_MATERIAL];
            $totalXp += self::XP_FULL_MATERIAL;
        }

        if ($totalXp <= 0) {
            return [
                'xp_breakdown' => [],
                'total_xp'     => 0,
                'level_before' => $user->level,
                'level_after'  => $user->level,
                'level_up'     => false,
                'rank_before'  => $user->rank,
                'rank_after'   => $user->rank,
                'rank_up'      => false,
            ];
        }

        return $this->addXP($user, $totalXp, 'session_complete', 'Session completed', $session->id, $breakdown);
    }

    // ─────────────────────────────────────────────────────────────
    // Raw XP Addition
    // ─────────────────────────────────────────────────────────────

    /**
     * Add XP to user and check for level/rank up.
     */
    public function addXP(
        User $user,
        int $amount,
        string $source,
        ?string $description = null,
        ?string $sessionId = null,
        array $breakdown = []
    ): array {
        $levelBefore = (int) $user->level;
        $rankBefore  = (string) $user->rank;
        $xpBefore    = (int) $user->xp;

        // Calculate new XP and level
        $newXp    = $xpBefore + $amount;
        $newLevel = $this->calculateLevel($newXp);
        $newRank  = $this->rankForLevel($newLevel);

        // Persist
        DB::transaction(function () use ($user, $amount, $source, $description, $sessionId, $xpBefore, $newXp, $levelBefore, $newLevel, $newRank) {
            $user->update([
                'xp'           => $newXp,
                'total_xp_ever'=> ($user->total_xp_ever ?? 0) + $amount,
                'level'        => $newLevel,
                'rank'         => $newRank,
            ]);

            XpEvent::create([
                'user_id'     => $user->id,
                'xp_amount'   => $amount,
                'source'      => $source,
                'description' => $description,
                'session_id'  => $sessionId,
                'level_before'=> $levelBefore,
                'level_after' => $newLevel,
                'xp_before'   => $xpBefore,
                'xp_after'    => $newXp,
                'created_at'  => now(),
            ]);
        });

        $user->refresh();

        return [
            'xp_breakdown' => $breakdown,
            'total_xp'     => $amount,
            'level_before' => $levelBefore,
            'level_after'  => $newLevel,
            'level_up'     => $newLevel > $levelBefore,
            'rank_before'  => $rankBefore,
            'rank_after'   => $newRank,
            'rank_up'      => $newRank !== $rankBefore,
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // Streak
    // ─────────────────────────────────────────────────────────────

    /**
     * Update user streak based on learning activity today.
     * Should be called when a session is completed.
     */
    public function updateStreak(User $user): array
    {
        $today         = now()->toDateString();
        $lastLearning  = $user->last_learning_date
            ? $user->last_learning_date->toDateString()
            : null;

        $isNewDay      = $lastLearning !== $today;
        $streakContinued = $lastLearning === now()->subDay()->toDateString();

        $currentStreak = (int) ($user->current_streak ?? 0);
        $longestStreak = (int) ($user->longest_streak ?? 0);

        if ($isNewDay) {
            if ($streakContinued || $currentStreak === 0) {
                $currentStreak++;
            } else {
                // Streak broken (gap > 1 day)
                $currentStreak = 1;
            }

            $longestStreak = max($longestStreak, $currentStreak);

            $user->update([
                'current_streak'    => $currentStreak,
                'longest_streak'    => $longestStreak,
                'last_learning_date'=> $today,
            ]);
        }

        return [
            'current'    => $currentStreak,
            'longest'    => $longestStreak,
            'is_new_day' => $isNewDay,
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Calculate level from total XP.
     * Level N requires sum of xpFor(1..N) XP.
     * Uses binary search against cumulative thresholds.
     */
    public static function calculateLevel(int $totalXp): int
    {
        $level = 1;
        $cumulative = 0;
        while (true) {
            $needed = self::xpNeededForLevel($level);
            if ($cumulative + $needed > $totalXp) {
                break;
            }
            $cumulative += $needed;
            $level++;
            if ($level >= 1000) break; // Safety cap
        }
        return $level;
    }

    /**
     * XP required to complete a given level.
     * Formula: 100 * level^1.5 (rounded)
     */
    public static function xpNeededForLevel(int $level): int
    {
        return (int) round(100 * pow($level, 1.5));
    }

    /**
     * Map level to rank name.
     */
    public static function rankForLevel(int $level): string
    {
        foreach (self::RANKS as $threshold => $rank) {
            if ($level >= $threshold) {
                return $rank;
            }
        }
        return 'Seedling';
    }
}
