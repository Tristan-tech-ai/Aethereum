<?php

namespace App\Services;

use App\Models\AssistantConversation;
use App\Models\KnowledgeCard;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\QuizAttempt;
use App\Models\User;

/**
 * Builds a rich context snapshot for the assistant from the user's learning data.
 */
class AssistantContextService
{
    /**
     * Build a compact text context block from the user's profile and activities.
     * Optimised: single eager-loaded query for sessions + limited card queries.
     */
    public function buildUserContext(User $user): string
    {
        $lines = [];

        $lines[] = "=== USER PROFILE ===";
        $lines[] = "Name: {$user->name} | Level: {$user->level} ({$user->rank}) | XP: {$user->total_xp_ever}";
        $lines[] = "Streak: {$user->current_streak} days | Sessions: {$user->total_sessions} | Cards: {$user->total_knowledge_cards}";

        // Active sessions — single query with eager load
        $activeSessions = LearningSession::where('user_id', $user->id)
            ->whereIn('status', ['active', 'paused'])
            ->with('content:id,title,subject_category')
            ->limit(5)
            ->get();

        if ($activeSessions->isNotEmpty()) {
            $lines[] = "\n=== ACTIVE SESSIONS ===";
            foreach ($activeSessions as $s) {
                $pct = $s->total_sections > 0
                    ? round(($s->current_section / $s->total_sections) * 100)
                    : 0;
                $lines[] = "- [{$s->status}] {$s->content?->title} — {$pct}% done, Focus: " . round($s->focus_integrity ?? 0) . "%";
            }
        }

        // Knowledge cards: weak areas only (most actionable data for assistant)
        $weakCards = KnowledgeCard::where('user_id', $user->id)
            ->where('mastery_percentage', '<', 80)
            ->orderBy('mastery_percentage')
            ->limit(5)
            ->get(['title', 'subject_category', 'mastery_percentage', 'tier']);

        if ($weakCards->isNotEmpty()) {
            $lines[] = "\n=== WEAK AREAS ===";
            foreach ($weakCards as $c) {
                $lines[] = "- [{$c->tier}] {$c->title} ({$c->subject_category}) — {$c->mastery_percentage}%";
            }
        }

        return implode("\n", $lines);
    }

    /**
     * Build context from a specific learning session (for in-session coaching).
     */
    public function buildSessionContext(LearningSession $session): string
    {
        $content = $session->content;
        $sections = $content?->structured_sections ?? [];

        $lines = [];
        $lines[] = "=== CURRENT LEARNING SESSION ===";
        $lines[] = "Material: " . ($content?->title ?? 'Unknown');
        $lines[] = "Subject: " . ($content?->subject_category ?? 'General');
        $lines[] = "Difficulty: " . ($content?->difficulty ?? 'unknown');
        $lines[] = "Progress: Section " . ($session->current_section + 1)
                 . " of " . ($session->total_sections ?? count($sections));
        $lines[] = "Focus Integrity: " . round($session->focus_integrity ?? 100) . "%";
        $lines[] = "Quiz Avg Score: " . round($session->quiz_avg_score ?? 0) . "%";
        $lines[] = "Time in Session: " . round(($session->total_focus_time ?? 0) / 60) . " minutes";

        // Current section content
        $currentIdx = $session->current_section ?? 0;
        if (!empty($sections[$currentIdx])) {
            $sec = $sections[$currentIdx];
            $lines[] = "\n=== CURRENT SECTION ===";
            $lines[] = "Title: " . ($sec['title'] ?? 'Unknown');
            $contentText = $sec['content_text'] ?? '';
            if (mb_strlen($contentText) > 1500) {
                $contentText = mb_substr($contentText, 0, 1500) . "\n[...section truncated]";
            }
            $lines[] = "Content:\n{$contentText}";
        }

        return implode("\n", $lines);
    }

    /**
     * Build context from a specific content (for content Q&A).
     */
    public function buildContentContext(LearningContent $content, int $sectionIndex = 0): string
    {
        $sections = $content->structured_sections ?? [];

        $lines = [];
        $lines[] = "=== LEARNING MATERIAL ===";
        $lines[] = "Title: {$content->title}";
        $lines[] = "Subject: {$content->subject_category}";
        $lines[] = "Difficulty: {$content->difficulty}";
        $lines[] = "Total Sections: " . count($sections);
        $lines[] = "Keywords: " . implode(', ', $content->ai_analysis['keywords'] ?? []);

        // Include specified section content
        if (!empty($sections[$sectionIndex])) {
            $sec = $sections[$sectionIndex];
            $lines[] = "\n=== SECTION " . ($sectionIndex + 1) . " ===";
            $lines[] = "Title: " . ($sec['title'] ?? 'Unknown');
            $contentText = $sec['content_text'] ?? '';
            if (mb_strlen($contentText) > 2000) {
                $contentText = mb_substr($contentText, 0, 2000) . "\n[...truncated]";
            }
            $lines[] = $contentText;
        }

        return implode("\n", $lines);
    }

    /**
     * Build context from conversation history (last N messages).
     */
    public function buildConversationHistory(AssistantConversation $conversation, int $limit = 8): array
    {
        return $conversation->messages()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['role', 'content'])
            ->reverse()
            ->values()
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();
    }

    /**
     * Get user's content library titles (for study plan generation).
     */
    public function getUserContentList(User $user): string
    {
        $contents = LearningContent::where('user_id', $user->id)
            ->where('status', 'ready')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'title', 'subject_category', 'difficulty', 'estimated_duration']);

        if ($contents->isEmpty()) {
            return "User has no uploaded content yet.";
        }

        $lines = ["=== USER CONTENT LIBRARY ==="];
        foreach ($contents as $c) {
            $lines[] = "- [{$c->id}] {$c->title} ({$c->subject_category}, {$c->difficulty}, ~{$c->estimated_duration}min)";
        }

        return implode("\n", $lines);
    }
}
