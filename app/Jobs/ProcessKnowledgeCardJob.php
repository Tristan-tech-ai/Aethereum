<?php

namespace App\Jobs;

use App\Models\KnowledgeCard;
use App\Models\LearningSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessKnowledgeCardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public LearningSession $session
    ) {}

    /**
     * Create a Knowledge Card from a completed session.
     *
     * Mastery = quiz 40% + focus 30% + summary 30%
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

        // Skip if card already exists for this session
        if (KnowledgeCard::where('session_id', $session->id)->exists()) {
            Log::info("ProcessKnowledgeCardJob: card already exists for session {$session->id}");
            return;
        }

        // ─── Calculate Mastery ───
        $quizScore   = (float) ($session->quiz_avg_score ?? 0);
        $focusScore  = (float) ($session->focus_integrity ?? 0);
        $summaryScore = (float) ($session->summary_score ?? 0);

        $mastery = (int) round(
            ($quizScore * 0.40) + ($focusScore * 0.30) + ($summaryScore * 0.30)
        );
        $mastery = min(100, max(0, $mastery));

        $tier = KnowledgeCard::tierFromMastery($mastery);

        // ─── Create Knowledge Card ───
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

        // ─── Update user statistics ───
        $user->increment('total_sessions');
        $user->increment('total_knowledge_cards');

        Log::info("ProcessKnowledgeCardJob completed for session {$session->id}", [
            'card_id' => $card->id,
            'mastery' => $mastery,
            'tier'    => $tier,
        ]);

        // TODO: Award XP via KnowledgeProfileService (Phase 5)
        // TODO: Award coins via CoinEconomyService (Phase 5)
        // TODO: Check achievements via AchievementService (Phase 5)
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessKnowledgeCardJob failed for session: {$this->session->id}", [
            'error' => $exception->getMessage(),
        ]);
    }
}
