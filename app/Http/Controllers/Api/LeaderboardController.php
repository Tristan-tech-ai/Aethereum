<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    use ApiResponse;

    public function focus(Request $request): JsonResponse
    {
        // Weekly Focus Champions
        // Users ranked by `total_sessions` or focus-based logic
        $users = User::where('show_on_leaderboard', true)
            ->orderBy('total_learning_hours', 'desc')
            ->limit(50)
            ->get(['id', 'username', 'name', 'avatar_url', 'level', 'rank', 'total_learning_hours']);

        return $this->success([
            'leaderboard' => $users,
            'type' => 'focus',
            'title' => 'Focus Champions',
        ], 'Focus leaderboard retrieved successfully');
    }

    public function knowledge(Request $request): JsonResponse
    {
        // Knowledge Collectors
        $users = User::where('show_on_leaderboard', true)
            ->orderBy('total_knowledge_cards', 'desc')
            ->orderBy('xp', 'desc')
            ->limit(50)
            ->get(['id', 'username', 'name', 'avatar_url', 'level', 'rank', 'total_knowledge_cards', 'xp']);

        return $this->success([
            'leaderboard' => $users,
            'type' => 'knowledge',
            'title' => 'Knowledge Collectors',
        ], 'Knowledge leaderboard retrieved successfully');
    }

    public function streak(Request $request): JsonResponse
    {
        // Streak Warriors
        $users = User::where('show_on_leaderboard', true)
            ->orderBy('current_streak', 'desc')
            ->limit(50)
            ->get(['id', 'username', 'name', 'avatar_url', 'level', 'rank', 'current_streak']);

        return $this->success([
            'leaderboard' => $users,
            'type' => 'streak',
            'title' => 'Streak Warriors',
        ], 'Streak leaderboard retrieved successfully');
    }

    public function quiz(Request $request): JsonResponse
    {
        // Quiz Masters (could be based on xp gained via quizzes or total xp)
        // Here we'll fallback to ranking by total XP for now as a placeholder
        $users = User::where('show_on_leaderboard', true)
            ->orderBy('total_xp_ever', 'desc')
            ->limit(50)
            ->get(['id', 'username', 'name', 'avatar_url', 'level', 'rank', 'total_xp_ever']);

        return $this->success([
            'leaderboard' => $users,
            'type' => 'quiz',
            'title' => 'Quiz Masters',
        ], 'Quiz leaderboard retrieved successfully');
    }

    public function subject(Request $request, string $subject): JsonResponse
    {
        // Top learners per subject
        // We'd ideally join User <-> KnowledgeCard on subject and sum mastery or count
        // Because that's an expensive query, we'd normally use Redis or a materialized view.
        // Simple fallback query for demonstration
        $users = User::where('show_on_leaderboard', true)
            ->whereHas('knowledgeCards', function ($query) use ($subject) {
                $query->where('subject', $subject);
            })
            ->withCount(['knowledgeCards as subject_cards_count' => function ($query) use ($subject) {
                $query->where('subject', $subject);
            }])
            ->orderBy('subject_cards_count', 'desc')
            ->limit(50)
            ->get(['id', 'username', 'name', 'avatar_url', 'level', 'rank']);

        return $this->success([
            'leaderboard' => $users,
            'type' => 'subject',
            'subject' => $subject,
            'title' => "Top in $subject",
        ], "Subject leaderboard retrieved successfully");
    }
}
