<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessKnowledgeCardJob;
use App\Models\CoinTransaction;
use App\Models\KnowledgeCard;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\XpEvent;
use App\Services\FocusTrackerService;
use App\Services\GeminiService;
use App\Services\LearningFlowService;
use App\Services\QuizGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function __construct(
        private LearningFlowService $flowService,
        private FocusTrackerService $focusTracker,
        private QuizGeneratorService $quizGenerator,
    ) {}

    // ─────────────────────────────────────────────────────────────
    // GET /api/v1/sessions/active
    // ─────────────────────────────────────────────────────────────

    /**
     * List all active/paused learning sessions for the authenticated user.
     */
    public function myActiveSessions(Request $request): JsonResponse
    {
        $sessions = LearningSession::where('user_id', $request->user()->id)
            ->whereIn('status', ['active', 'paused'])
            ->with(['content:id,title,subject_category,content_type,estimated_duration'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (LearningSession $s) => [
                'id'               => $s->id,
                'content_id'       => $s->content_id,
                'status'           => $s->status,
                'current_section'  => $s->current_section,
                'total_sections'   => $s->total_sections,
                'focus_integrity'  => $s->focus_integrity,
                'quiz_avg_score'   => $s->quiz_avg_score,
                'xp_earned'        => $s->xp_earned,
                'total_focus_time' => $s->total_focus_time,
                'started_at'       => $s->started_at,
                'updated_at'       => $s->updated_at,
                'progress_data'    => $s->progress_data,
                'content'          => $s->content ? [
                    'id'                 => $s->content->id,
                    'title'              => $s->content->title,
                    'subject_category'   => $s->content->subject_category,
                    'content_type'       => $s->content->content_type,
                    'estimated_duration' => $s->content->estimated_duration,
                ] : null,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $sessions,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/v1/sessions/completed
    // ─────────────────────────────────────────────────────────────

    public function completedSessions(Request $request): JsonResponse
    {
        $sessions = LearningSession::where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->with(['content:id,title,subject_category,content_type,estimated_duration,content_type'])
            ->orderByDesc('completed_at')
            ->get()
            ->map(fn (LearningSession $s) => [
                'id'               => $s->id,
                'content_id'       => $s->content_id,
                'status'           => $s->status,
                'current_section'  => $s->current_section,
                'total_sections'   => $s->total_sections,
                'focus_integrity'  => $s->focus_integrity,
                'quiz_avg_score'   => $s->quiz_avg_score,
                'xp_earned'        => $s->xp_earned,
                'total_focus_time' => $s->total_focus_time,
                'completed_at'     => $s->completed_at,
                'content'          => $s->content ? [
                    'id'                 => $s->content->id,
                    'title'              => $s->content->title,
                    'subject_category'   => $s->content->subject_category,
                    'content_type'       => $s->content->content_type,
                    'estimated_duration' => $s->content->estimated_duration,
                ] : null,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $sessions,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/sessions/start
    // ─────────────────────────────────────────────────────────────

    /**
     * Start a new learning session for a given content.
     */
    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'content_id' => ['required', 'uuid'],
        ]);

        $user    = $request->user();
        $content = LearningContent::where('id', $request->input('content_id'))
            ->where('user_id', $user->id)
            ->where('status', 'ready')
            ->firstOrFail();

        // Check if user already has an active session for this content
        $activeSession = LearningSession::where('user_id', $user->id)
            ->where('content_id', $content->id)
            ->where('status', 'active')
            ->first();

        if ($activeSession) {
            // Resume existing session
            return response()->json([
                'message' => 'Resuming existing session.',
                'data'    => $this->buildSessionResponse($activeSession, $content),
            ]);
        }

        // Build flow config
        $flowType = $this->flowService->selectFlow($content);
        $config   = $this->flowService->configureDocumentDungeon($content);
        $sections = $content->structured_sections ?? [];

        // Create new session
        $session = LearningSession::create([
            'user_id'          => $user->id,
            'content_id'       => $content->id,
            'flow_type'        => $flowType,
            'current_section'  => 0,
            'total_sections'   => count($sections),
            'started_at'       => now(),
            'status'           => 'active',
            'focus_integrity'  => 100.00,
            'tab_switches'     => 0,
            'distraction_count'=> 0,
            'total_focus_time' => 0,
            'total_break_time' => 0,
            'progress_data'    => [
                'sections_completed' => [],
                'config'             => $config,
            ],
        ]);

        return response()->json([
            'message' => 'Session started successfully.',
            'data'    => $this->buildSessionResponse($session, $content),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────
    // PATCH /api/v1/sessions/{id}/progress
    // ─────────────────────────────────────────────────────────────

    /**
     * Update section progress and focus events.
     */
    public function updateProgress(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'current_section' => ['sometimes', 'integer', 'min:0'],
            'active_time'     => ['sometimes', 'integer', 'min:0'],
            'events'          => ['sometimes', 'array'],
            'events.*.type'   => ['required_with:events', 'string', 'in:tab_switch,window_blur,restore'],
            'events.*.timestamp' => ['sometimes', 'string'],
        ]);

        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        // Update current section if provided
        if ($request->has('current_section')) {
            $newSection = $request->input('current_section');

            // Track completed sections
            $progressData = $session->progress_data ?? [];
            $completed    = $progressData['sections_completed'] ?? [];

            if ($session->current_section !== $newSection && !in_array($session->current_section, $completed)) {
                $completed[] = $session->current_section;
                $progressData['sections_completed'] = $completed;
            }

            $session->update([
                'current_section' => $newSection,
                'progress_data'   => $progressData,
            ]);
        }

        // Update focus metrics if events are provided
        if ($request->has('events') || $request->has('active_time')) {
            $session = $this->focusTracker->updateFocusMetrics($session, [
                'events'      => $request->input('events', []),
                'active_time' => $request->input('active_time', 0),
            ]);
        }

        return response()->json([
            'message' => 'Progress updated.',
            'data'    => [
                'id'                => $session->id,
                'current_section'   => $session->current_section,
                'total_sections'    => $session->total_sections,
                'focus_integrity'   => $session->focus_integrity,
                'tab_switches'      => $session->tab_switches,
                'distraction_count' => $session->distraction_count,
                'total_focus_time'  => $session->total_focus_time,
                'progress_data'     => $session->progress_data,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/v1/sessions/{id}/quiz
    // ─────────────────────────────────────────────────────────────

    /**
     * Get or generate quiz questions for a specific section.
     */
    public function getQuiz(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'section' => ['required', 'integer', 'min:0'],
        ]);

        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'paused'])
            ->firstOrFail();

        $content = $session->content;
        $quiz    = $this->quizGenerator->getOrGenerateQuiz($content, $request->input('section'));

        return response()->json([
            'data' => [
                'quiz_id'        => $quiz->id,
                'questions'      => $quiz->questions,
                'time_limit'     => $quiz->time_limit_seconds,
                'pass_threshold' => $quiz->pass_threshold,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/sessions/{id}/quiz-attempt
    // ─────────────────────────────────────────────────────────────

    /**
     * Submit and grade a quiz attempt for the current section.
     */
    public function submitQuizAttempt(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'section_index'              => ['required', 'integer', 'min:0'],
            'answers'                    => ['required', 'array', 'min:1'],
            'answers.*.question_index'   => ['required', 'integer', 'min:0'],
            'answers.*.selected_index'   => ['required', 'integer', 'min:0'],
            'answers.*.time_taken_ms'    => ['sometimes', 'integer', 'min:0'],
        ]);

        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $content = $session->content;

        // Get or generate quiz for this section
        $quiz = $this->quizGenerator->getOrGenerateQuiz(
            $content,
            $request->input('section_index')
        );

        // Grade the attempt
        $gradeResult = $this->quizGenerator->gradeAttempt(
            $quiz,
            $request->input('answers')
        );

        // Record the attempt
        $attempt = $this->quizGenerator->recordAttempt(
            $quiz,
            $session,
            $user->id,
            $gradeResult
        );

        return response()->json([
            'message' => $gradeResult['passed'] ? 'Quiz passed! 🎉' : 'Quiz not passed. Try again!',
            'data'    => [
                'attempt_id'       => $attempt->id,
                'correct_count'    => $gradeResult['correct_count'],
                'total_questions'  => $gradeResult['total_questions'],
                'score_percentage' => $gradeResult['score_percentage'],
                'passed'           => $gradeResult['passed'],
                'answers'          => $gradeResult['answers'],
                'quiz'             => [
                    'id'             => $quiz->id,
                    'pass_threshold' => $quiz->pass_threshold,
                ],
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/sessions/{id}/validate-summary
    // ─────────────────────────────────────────────────────────────

    /**
     * AI validate user summary using Gemini.
     */
    public function validateSummary(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'summary' => ['required', 'string', 'min:50', 'max:5000'],
        ]);

        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $summary = $request->input('summary');
        $content = $session->content;

        // Build original content context from sections
        $sections      = $content->structured_sections ?? [];
        $sectionTitles = collect($sections)->pluck('title')->toArray();
        $originalText  = collect($sections)
            ->pluck('content_text')
            ->filter()
            ->implode("\n\n");

        // Attempt AI validation, fall back to heuristics
        try {
            $gemini = app(GeminiService::class);
            $result = $gemini->validateSummary($summary, $originalText, $sectionTitles);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Gemini summary validation failed, using heuristic: " . $e->getMessage());
            $result = $this->heuristicSummaryValidation($summary);
        }

        $score    = (int) ($result['score'] ?? 0);
        $approved = (bool) ($result['approved'] ?? ($score >= 60));

        $session->update([
            'user_summary'  => $summary,
            'summary_score' => $score,
        ]);

        return response()->json([
            'message' => $approved
                ? 'Ringkasan disetujui! Kerja bagus. ✅'
                : 'Ringkasan perlu ditingkatkan. Coba tambahkan lebih banyak detail.',
            'data' => [
                'score'    => $score,
                'approved' => $approved,
                'feedback' => $result['feedback'] ?? [
                    'completeness'     => 'Unable to evaluate.',
                    'accuracy'         => 'Unable to evaluate.',
                    'clarity'          => 'Unable to evaluate.',
                    'missing_concepts' => [],
                ],
            ],
        ]);
    }

    /**
     * Heuristic fallback if Gemini is unavailable.
     */
    private function heuristicSummaryValidation(string $summary): array
    {
        $wordCount   = str_word_count($summary);
        $lengthScore = min(100, ($wordCount / 150) * 100);
        $hasStructure = preg_match('/[\.\!\?]/', $summary) ? 10 : 0;
        $score        = min(100, (int) round($lengthScore + $hasStructure));

        return [
            'score'    => $score,
            'approved' => $score >= 60,
            'feedback' => [
                'completeness'     => $lengthScore >= 60
                    ? 'Good coverage of the material.'
                    : 'Try to cover more key concepts from the material.',
                'accuracy'         => 'Please ensure your summary reflects the actual content.',
                'clarity'          => $hasStructure
                    ? 'Well-structured writing.'
                    : 'Consider adding proper sentence structure.',
                'missing_concepts' => $score < 60 ? ['Cover the main themes more thoroughly'] : [],
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/sessions/{id}/complete
    // ─────────────────────────────────────────────────────────────

    /**
     * Complete a learning session. Triggers ProcessKnowledgeCardJob.
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'summary' => ['nullable', 'string', 'min:50', 'max:5000'],
            'actual_duration' => ['nullable', 'integer', 'min:0'],
        ]);

        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        // Persist summary from client if provided; if summary score doesn't exist yet,
        // validate it now so rewards/card mastery include summary quality.
        $incomingSummary = trim((string) $request->input('summary', ''));
        if ($incomingSummary !== '') {
            $sections      = $session->content?->structured_sections ?? [];
            $sectionTitles = collect($sections)->pluck('title')->toArray();
            $originalText  = collect($sections)
                ->pluck('content_text')
                ->filter()
                ->implode("\n\n");

            if ($session->user_summary !== $incomingSummary || $session->summary_score === null) {
                try {
                    $gemini = app(GeminiService::class);
                    $result = $gemini->validateSummary($incomingSummary, $originalText, $sectionTitles);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Gemini summary validation failed in complete(), using heuristic: " . $e->getMessage());
                    $result = $this->heuristicSummaryValidation($incomingSummary);
                }

                $session->update([
                    'user_summary'  => $incomingSummary,
                    'summary_score' => (int) ($result['score'] ?? 0),
                ]);
            }
        }

        // Mark final section as completed
        $progressData = $session->progress_data ?? [];
        $completed    = $progressData['sections_completed'] ?? [];
        if (!in_array($session->current_section, $completed)) {
            $completed[] = $session->current_section;
            $progressData['sections_completed'] = $completed;
        }

        // Update session to completed
        $session->update([
            'status'        => 'completed',
            'completed_at'  => now(),
            'progress_data' => $progressData,
        ]);

        // Run synchronously so API response always includes card/rewards immediately,
        // regardless of QUEUE_CONNECTION configuration.
        ProcessKnowledgeCardJob::dispatchSync($session->fresh());

        // Update user's last_learning_date for streak tracking
        $user->update([
            'last_learning_date' => now()->toDateString(),
        ]);

        // -- Query results created by the sync job --
        $card    = KnowledgeCard::where('session_id', $session->id)->first();
        $xpEvent = XpEvent::where('session_id', $session->id)
            ->orderByDesc('created_at')
            ->first();
        $user->refresh();

        // Build rewards payload for frontend
        $xpBreakdown = [];
        $totalXp     = 0;
        if ($xpEvent) {
            $totalXp     = $xpEvent->xp_amount;
            $xpBreakdown = [['label' => 'Session completed', 'xp' => $totalXp]];
        }

        $coinsEarned = (int) (CoinTransaction::where('user_id', $user->id)
            ->where('source', 'session_complete')
            ->latest('created_at')
            ->value('amount') ?? 0);

        return response()->json([
            'message' => 'Session completed! Knowledge Card generated. 🎉',
            'data'    => [
                'id'               => $session->id,
                'status'           => 'completed',
                'completed_at'     => $session->completed_at,
                'focus_integrity'  => $session->focus_integrity,
                'quiz_avg_score'   => $session->quiz_avg_score,
                'summary_score'    => $session->summary_score,
                'total_focus_time' => $session->total_focus_time,
                'card'             => $card,
                'rewards'          => [
                    'xp_breakdown' => $xpBreakdown,
                    'total_xp'     => $totalXp,
                    'level_before' => $xpEvent?->level_before ?? $user->level,
                    'level_after'  => $xpEvent?->level_after  ?? $user->level,
                    'level_up'     => $xpEvent && $xpEvent->level_after > $xpEvent->level_before,
                    'rank_before'  => $user->rank,
                    'rank_after'   => $user->rank,
                    'coins_earned' => $coinsEarned,
                    'streak_update'=> [
                        'current'    => $user->current_streak,
                        'longest'    => $user->longest_streak,
                        'is_new_day' => true,
                    ],
                    'achievements' => [],
                ],
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Build a consistent session response payload.
     */
    private function buildSessionResponse(LearningSession $session, LearningContent $content): array
    {
        $sections    = $content->structured_sections ?? [];
        $currentIdx  = $session->current_section;
        $firstSection = $sections[$currentIdx] ?? null;

        return [
            'session'         => [
                'id'               => $session->id,
                'flow_type'        => $session->flow_type,
                'current_section'  => $session->current_section,
                'total_sections'   => $session->total_sections,
                'status'           => $session->status,
                'focus_integrity'  => $session->focus_integrity,
                'tab_switches'     => $session->tab_switches,
                'total_focus_time' => $session->total_focus_time,
                'started_at'       => $session->started_at,
                'progress_data'    => $session->progress_data,
            ],
            'content'         => [
                'id'                  => $content->id,
                'title'               => $content->title,
                'content_type'        => $content->content_type,
                'subject_category'    => $content->subject_category,
                'subject_icon'        => $content->subject_icon,
                'difficulty'          => $content->difficulty,
                'total_sections'      => count($sections),
                'estimated_duration'  => $content->estimated_duration,
                'structured_sections' => $sections,
            ],
            'current_section' => $firstSection,
            'flow_config'     => $this->flowService->getFlowConfig($session->flow_type),
        ];
    }
}
