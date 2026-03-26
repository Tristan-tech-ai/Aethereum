<?php

namespace App\Jobs;

use App\Models\FeedEvent;
use App\Models\KnowledgeCard;
use App\Models\LearningSession;
use App\Services\AchievementService;
use App\Services\CoinEconomyService;
use App\Services\KnowledgeProfileService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessKnowledgeCardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 30;

    public function __construct(
        public LearningSession $session
    ) {}

    /**
     * Create a Knowledge Card and award all rewards for a completed session.
     */
    public function handle(): void
    {
        $session = $this->session->load('content', 'user');
        $content = $session->content;
        $user    = $session->user;

        if (!$content || !$user) {
            Log::warning("ProcessKnowledgeCardJob: missing content or user for session {$session->id}");
            return;
        }

        // Skip if card already exists
        if (KnowledgeCard::where('session_id', $session->id)->exists()) {
            Log::info("ProcessKnowledgeCardJob: card already exists for session {$session->id}");
            return;
        }

        // â”€â”€â”€ Calculate Mastery â”€â”€â”€
        $quizScore    = (float) ($session->quiz_avg_score ?? 0);
        $focusScore   = (float) ($session->focus_integrity ?? 0);
        $summaryScore = (float) ($session->summary_score ?? 0);

        $mastery = (int) round(
            ($quizScore * 0.40) + ($focusScore * 0.30) + ($summaryScore * 0.30)
        );
        $mastery = min(100, max(0, $mastery));
        $tier    = KnowledgeCard::tierFromMastery($mastery);

        // â”€â”€â”€ Create Knowledge Card â”€â”€â”€
        $card = KnowledgeCard::create([
            'user_id'             => $user->id,
            'content_id'          => $content->id,
            'session_id'          => $session->id,
            'title'               => $content->title,
            'subject_category'    => $content->subject_category,
            'subject_icon'        => $content->subject_icon,
            'subject_color'       => $content->subject_color,
            'mastery_percentage'  => $mastery,
            'quiz_avg_score'      => $quizScore,
            'focus_integrity'     => $focusScore,
            'time_invested'       => $session->total_focus_time,
            'tier'                => $tier,
            'summary_snippet'     => $session->user_summary
                ? mb_substr($session->user_summary, 0, 300)
                : null,
            'keywords'            => $content->ai_analysis['keywords'] ?? [],
            'is_pinned'           => false,
            'is_public'           => $user->is_profile_public ?? false,
            'likes'               => 0,
            'is_collaborative'    => false,
            'collaborators'       => null,
            'last_reviewed_at'    => now(),
            'integrity_decay_rate'=> 0.50,
        ]);

        // â”€â”€â”€ Update user statistics â”€â”€â”€
        $user->increment('total_sessions');
        $user->increment('total_knowledge_cards');
        $user->refresh();

        // â”€â”€â”€ Award XP â”€â”€â”€
        $xpResult = [];
        try {
            $profileService = app(KnowledgeProfileService::class);
            $xpResult       = $profileService->awardSessionXP($session, $user);
        } catch (\Throwable $e) {
            Log::error("KnowledgeProfileService XP award failed: " . $e->getMessage());
        }

        // â”€â”€â”€ Update Streak â”€â”€â”€
        try {
            $streakResult = app(KnowledgeProfileService::class)->updateStreak($user->fresh());
        } catch (\Throwable $e) {
            Log::error("Streak update failed: " . $e->getMessage());
            $streakResult = ['current' => 0, 'longest' => 0, 'is_new_day' => false];
        }

        // â”€â”€â”€ Award Coins â”€â”€â”€
        $coinResult = [];
        try {
            $coinService = app(CoinEconomyService::class);
            $coinResult  = $coinService->awardSessionCoins($session, $user->fresh());
        } catch (\Throwable $e) {
            Log::error("CoinEconomyService award failed: " . $e->getMessage());
        }

        // â”€â”€â”€ Check Achievements â”€â”€â”€
        $newAchievements = [];
        try {
            $newAchievements = app(AchievementService::class)->checkAndAward($user->fresh());
        } catch (\Throwable $e) {
            Log::error("AchievementService check failed: " . $e->getMessage());
        }

        // â”€â”€â”€ Log Feed Events â”€â”€â”€
        try {
            $this->logFeedEvents($user->id, $card, $xpResult, $streakResult, $newAchievements);
        } catch (\Throwable $e) {
            Log::error("Feed event logging failed: " . $e->getMessage());
        }

        Log::info("ProcessKnowledgeCardJob completed for session {$session->id}", [
            'card_id'     => $card->id,
            'mastery'     => $mastery,
            'tier'        => $tier,
            'xp_awarded'  => $xpResult['total_xp'] ?? 0,
            'coins'       => $coinResult['coins_awarded'] ?? 0,
            'achievements'=> count($newAchievements),
        ]);
    }

    private function logFeedEvents(string $userId, KnowledgeCard $card, array $xpResult, array $streakResult, array $achievements): void
    {
        FeedEvent::create([
            'user_id'    => $userId,
            'event_type' => 'card_created',
            'event_data' => [
                'card_id'  => $card->id,
                'title'    => $card->title,
                'tier'     => $card->tier,
                'mastery'  => $card->mastery_percentage,
            ],
            'is_public'  => true,
            'created_at' => now(),
        ]);

        if (!empty($xpResult['level_up'])) {
            FeedEvent::create([
                'user_id'    => $userId,
                'event_type' => 'level_up',
                'event_data' => [
                    'level_before' => $xpResult['level_before'],
                    'level_after'  => $xpResult['level_after'],
                ],
                'is_public'  => true,
                'created_at' => now(),
            ]);
        }

        if (!empty($xpResult['rank_up'])) {
            FeedEvent::create([
                'user_id'    => $userId,
                'event_type' => 'rank_up',
                'event_data' => [
                    'rank_before' => $xpResult['rank_before'],
                    'rank_after'  => $xpResult['rank_after'],
                ],
                'is_public'  => true,
                'created_at' => now(),
            ]);
        }

        foreach ($achievements as $achievement) {
            FeedEvent::create([
                'user_id'    => $userId,
                'event_type' => 'achievement_unlocked',
                'event_data' => $achievement,
                'is_public'  => true,
                'created_at' => now(),
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessKnowledgeCardJob failed for session: {$this->session->id}", [
            'error' => $exception->getMessage(),
        ]);
    }
}