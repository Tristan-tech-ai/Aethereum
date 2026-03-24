<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessKnowledgeCardJob;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Services\FocusTrackerService;
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
    // POST /api/v1/sessions/start
    // ─────────────────────────────────────────────────────────────

    /**
     * Start a new learning session for a given content.
     */
    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'content_id' => ['required', 'uuid', 'exists:learning_contents,id'],
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
     * AI validate user summary.
     *
     * TODO: Integrate with GeminiService for real AI validation.
     */
    public function validateSummary(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'summary' => ['required', 'string', 'min:100'],
        ]);

        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $summary = $request->input('summary');

        // TODO: Replace with actual Gemini AI validation:
        // $validationResult = app(GeminiService::class)->validateSummary(
        //     $session->content->structured_sections,
        //     $summary
        // );

        // ─── Placeholder scoring ───
        // Simple heuristics until Gemini is integrated
        $wordCount  = str_word_count($summary);
        $charCount  = mb_strlen($summary);

        // Base score from length (longer = better, up to a point)
        $lengthScore = min(100, ($wordCount / 150) * 100);

        // Simple quality indicators
        $hasStructure  = preg_match('/[\.\!\?]/', $summary) ? 10 : 0;
        $hasParagraphs = substr_count($summary, "\n") > 0 ? 5 : 0;

        $summaryScore = min(100, round($lengthScore + $hasStructure + $hasParagraphs));

        $approved = $summaryScore >= 60;

        // Save summary to session
        $session->update([
            'user_summary'  => $summary,
            'summary_score' => $summaryScore,
        ]);

        return response()->json([
            'message' => $approved
                ? 'Summary approved! Good work. ✅'
                : 'Summary needs improvement. Please add more detail.',
            'data'    => [
                'score'    => $summaryScore,
                'approved' => $approved,
                'feedback' => [
                    'completeness' => $lengthScore >= 60
                        ? 'Good coverage of the material.'
                        : 'Try to cover more key concepts from the material.',
                    'accuracy'     => 'Please ensure your summary reflects the actual content.',
                    'clarity'      => $hasStructure
                        ? 'Well-structured writing.'
                        : 'Consider adding proper sentence structure.',
                    'word_count'   => $wordCount,
                    'missing_concepts' => $approved ? [] : ['Consider covering the main themes more thoroughly'],
                ],
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/sessions/{id}/complete
    // ─────────────────────────────────────────────────────────────

    /**
     * Complete a learning session. Triggers ProcessKnowledgeCardJob.
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $user    = $request->user();
        $session = LearningSession::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

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

        // Dispatch job to create Knowledge Card, award XP, coins, etc.
        ProcessKnowledgeCardJob::dispatch($session);

        // Update user's last_learning_date for streak tracking
        $user->update([
            'last_learning_date' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Session completed! Your Knowledge Card is being generated. 🎉',
            'data'    => [
                'id'               => $session->id,
                'status'           => 'completed',
                'completed_at'     => $session->completed_at,
                'focus_integrity'  => $session->focus_integrity,
                'quiz_avg_score'   => $session->quiz_avg_score,
                'summary_score'    => $session->summary_score,
                'total_focus_time' => $session->total_focus_time,
                'progress_data'    => $session->progress_data,
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
            ],
            'current_section' => $firstSection,
            'flow_config'     => $this->flowService->getFlowConfig($session->flow_type),
        ];
    }
}
