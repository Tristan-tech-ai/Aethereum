<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    public function learning(Request $request): JsonResponse
    {
        $user = $request->user();

        $subjectMastery = $user->knowledgeCards()
            ->select(
                'subject_category as subject',
                DB::raw('ROUND(AVG(mastery_percentage)) as mastery'),
                DB::raw('ROUND(SUM(time_invested) / 60) as hours'),
                DB::raw('COUNT(*) as cards')
            )
            ->groupBy('subject_category')
            ->orderByDesc('mastery')
            ->limit(8)
            ->get()
            ->map(function ($row, $idx) {
                $colors = ['#7C3AED', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#22C55E'];
                return [
                    'subject' => $row->subject ?: 'General',
                    'mastery' => (int) $row->mastery,
                    'hours' => (int) $row->hours,
                    'cards' => (int) $row->cards,
                    'color' => $colors[$idx % count($colors)],
                ];
            })
            ->values();

        $cardTiers = $user->knowledgeCards()
            ->select('tier', DB::raw('COUNT(*) as count'))
            ->groupBy('tier')
            ->get()
            ->map(function ($row) {
                $tier = strtolower((string) $row->tier);
                return [
                    'tier' => ucfirst($tier ?: 'bronze'),
                    'count' => (int) $row->count,
                    'color' => match ($tier) {
                        'diamond' => '#B9F2FF',
                        'gold' => '#FFD700',
                        'silver' => '#C0C0C0',
                        default => '#CD7F32',
                    },
                    'emoji' => match ($tier) {
                        'diamond' => '💎',
                        'gold' => '🥇',
                        'silver' => '🥈',
                        default => '🥉',
                    },
                ];
            })
            ->values();

        $monthlyComparison = DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("to_char(date_trunc('month', completed_at), 'Mon') as month")
            ->selectRaw('ROUND(SUM(total_focus_time) / 3600.0) as hours')
            ->selectRaw('COUNT(*) as sessions')
            ->selectRaw('COALESCE(SUM(quiz_passes), 0) as quizzesPassed')
            ->selectRaw('ROUND(AVG(focus_integrity)) as avgFocus')
            ->groupByRaw("date_trunc('month', completed_at)")
            ->orderByRaw("date_trunc('month', completed_at)")
            ->get()
            ->map(fn ($r) => [
                'month' => $r->month,
                'hours' => (int) $r->hours,
                'sessions' => (int) $r->sessions,
                'quizzesPassed' => (int) $r->quizzespassed,
                'avgFocus' => (int) $r->avgfocus,
            ])
            ->values();

        $quizTrend = DB::table('quiz_attempts')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("to_char(date_trunc('month', created_at), 'Mon') as month")
            ->selectRaw('ROUND(AVG(score_percentage)) as avgScore')
            ->selectRaw('SUM(CASE WHEN score_percentage = 100 THEN 1 ELSE 0 END) as perfect')
            ->selectRaw('SUM(CASE WHEN passed = false THEN 1 ELSE 0 END) as failed')
            ->groupByRaw("date_trunc('month', created_at)")
            ->orderByRaw("date_trunc('month', created_at)")
            ->get()
            ->map(fn ($r) => [
                'month' => $r->month,
                'avgScore' => (int) $r->avgscore,
                'perfect' => (int) $r->perfect,
                'failed' => (int) $r->failed,
            ])
            ->values();

        $focusDistributionRaw = DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->selectRaw('COUNT(CASE WHEN focus_integrity >= 90 THEN 1 END) as g90')
            ->selectRaw('COUNT(CASE WHEN focus_integrity >= 80 AND focus_integrity < 90 THEN 1 END) as g80')
            ->selectRaw('COUNT(CASE WHEN focus_integrity >= 70 AND focus_integrity < 80 THEN 1 END) as g70')
            ->selectRaw('COUNT(CASE WHEN focus_integrity >= 60 AND focus_integrity < 70 THEN 1 END) as g60')
            ->selectRaw('COUNT(CASE WHEN focus_integrity < 60 THEN 1 END) as l60')
            ->first();

        $focusDistribution = collect([
            ['range' => '90-100%', 'count' => (int) ($focusDistributionRaw->g90 ?? 0), 'color' => '#10B981'],
            ['range' => '80-89%', 'count' => (int) ($focusDistributionRaw->g80 ?? 0), 'color' => '#06B6D4'],
            ['range' => '70-79%', 'count' => (int) ($focusDistributionRaw->g70 ?? 0), 'color' => '#F59E0B'],
            ['range' => '60-69%', 'count' => (int) ($focusDistributionRaw->g60 ?? 0), 'color' => '#EF4444'],
            ['range' => '<60%', 'count' => (int) ($focusDistributionRaw->l60 ?? 0), 'color' => '#DC2626'],
        ]);

        $sessionLog = $user->learningSessions()
            ->with('content:id,title,subject_category')
            ->where('status', 'completed')
            ->latest('completed_at')
            ->limit(8)
            ->get()
            ->map(function ($s) {
                $dateLabel = optional($s->completed_at)->diffForHumans();
                return [
                    'title' => $s->content?->title ?? 'Learning Session',
                    'subject' => $s->content?->subject_category ?? 'General',
                    'date' => $dateLabel,
                    'duration' => ((int) round(((int) $s->total_focus_time) / 60)) . 'm',
                    'focus' => (int) round((float) ($s->focus_integrity ?? 0)),
                    'xp' => (int) ($s->xp_earned ?? 0),
                    'quizScore' => (int) round((float) ($s->quiz_avg_score ?? 0)),
                ];
            })
            ->values();

        $totalSessions = (int) $user->learningSessions()->where('status', 'completed')->count();
        $streak = (int) $user->current_streak;
        $diamondCards = (int) $user->knowledgeCards()->where('tier', 'Diamond')->count();

        $milestones = [
            [
                'label' => 'First Diamond Card',
                'date' => $diamondCards > 0 ? 'Unlocked' : '—',
                'emoji' => '💎',
                'done' => $diamondCards > 0,
                'progress' => $diamondCards > 0 ? 100 : min(99, $diamondCards * 20),
            ],
            [
                'label' => '100 Sessions Completed',
                'date' => $totalSessions >= 100 ? 'Unlocked' : '—',
                'emoji' => '🎯',
                'done' => $totalSessions >= 100,
                'progress' => min(100, (int) round(($totalSessions / 100) * 100)),
            ],
            [
                'label' => '30-Day Streak',
                'date' => $streak >= 30 ? 'Unlocked' : '—',
                'emoji' => '🔥',
                'done' => $streak >= 30,
                'progress' => min(100, (int) round(($streak / 30) * 100)),
            ],
        ];

        $stats = [
            'total_quizzes' => (int) DB::table('quiz_attempts')->where('user_id', $user->id)->where('passed', true)->count(),
            'avg_quiz_score' => (int) round((float) (DB::table('quiz_attempts')->where('user_id', $user->id)->avg('score_percentage') ?? 0)),
            'avg_focus' => (int) round((float) ($user->learningSessions()->where('status', 'completed')->avg('focus_integrity') ?? 0)),
            'total_cards' => (int) $user->knowledgeCards()->count(),
            'materials_completed' => (int) $user->learningContents()->where('status', 'ready')->count(),
        ];

        $skillRadar = [
            ['skill' => 'Problem Solving', 'score' => $stats['avg_quiz_score']],
            ['skill' => 'Critical Thinking', 'score' => max(0, min(100, (int) round(($stats['avg_quiz_score'] + $stats['avg_focus']) / 2)))],
            ['skill' => 'Memory Retention', 'score' => max(0, min(100, (int) round($stats['avg_quiz_score'] * 0.95)))],
            ['skill' => 'Focus Endurance', 'score' => $stats['avg_focus']],
            ['skill' => 'Quiz Performance', 'score' => $stats['avg_quiz_score']],
            ['skill' => 'Consistency', 'score' => max(0, min(100, (int) round(($user->current_streak / 30) * 100)))],
        ];

        return $this->success([
            'stats' => $stats,
            'subject_mastery' => $subjectMastery,
            'skill_radar' => $skillRadar,
            'quiz_trend' => $quizTrend,
            'card_tiers' => $cardTiers,
            'monthly_comparison' => $monthlyComparison,
            'focus_distribution' => $focusDistribution,
            'session_log' => $sessionLog,
            'milestones' => $milestones,
        ], 'Learning report retrieved');
    }
}
