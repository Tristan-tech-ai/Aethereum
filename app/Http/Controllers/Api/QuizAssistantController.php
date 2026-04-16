<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistantConversation;
use App\Models\AssistantMessage;
use App\Repositories\QuizSessionRepository;
use App\Services\AssistantConversationStateStoreService;
use App\Services\AssistantOrchestratorService;
use App\Services\QuizAssistantAdapterInterface;
use App\Services\QuizResultAnalyzerService;
use App\Services\QuizFeedbackGeneratorService;
use App\Services\QuizAssistantMetricsService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Requests\QuizAssistant\GenerateQuizRequest;
use App\Http\Requests\QuizAssistant\SubmitQuizRequest;
use App\Http\Requests\QuizAssistant\ChatMessageRequest;
use App\Http\Requests\QuizAssistant\ResetConfigRequest;

use App\Exceptions\QuizAssistant\QuizGenerationException;
use App\Exceptions\QuizAssistant\InvalidConversationStateException;
use App\Exceptions\QuizAssistant\MaterialNotFoundException;

class QuizAssistantController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected QuizAssistantAdapterInterface $adapter,
        protected QuizSessionRepository $sessionRepository,
        protected AssistantConversationStateStoreService $stateStore,
        protected QuizResultAnalyzerService $analyzerService,
        protected QuizFeedbackGeneratorService $feedbackService,
        protected QuizAssistantMetricsService $metricsService
    ) {}

    public function chatMessage(ChatMessageRequest $request, AssistantOrchestratorService $orchestrator): JsonResponse
    {
        $conversation = AssistantConversation::find($request->conversation_id);
        $input = $request->selected_option ?? $request->message ?? '';

        $response = $orchestrator->chat($conversation, $input);

        // Detect intent indirectly for metrics if phase just changed to material or intent
        if (isset($response['structured']['phase'])) {
            $phase = $response['structured']['phase'];
            if (in_array($phase, ['material', 'intent']) && stripos($input, 'quiz') !== false) {
                 $this->metricsService->recordIntentDetected('quiz_request');
            }
        }

        if (isset($response['is_flow']) && $response['is_flow']) {
            $structured = $response['structured'];
            
            return $this->success([
                'message' => $structured['message'] ?? '',
                'ui_type' => $structured['ui_type'] ?? 'text',
                'options' => $structured['options'] ?? null,
                'phase' => $structured['phase'],
                'quiz_session_id' => null,
            ]);
        }

        return $this->success([
            'message' => $response['structured']['message'] ?? '',
            'ui_type' => 'text',
            'options' => null,
            'phase' => 'general',
            'quiz_session_id' => null,
        ]);
    }

    public function resetConfig(ResetConfigRequest $request): JsonResponse
    {
        $conversation = AssistantConversation::find($request->conversation_id);

        $this->stateStore->saveState($conversation, [
            'phase' => 'intent',
            'payload' => [],
        ]);

        return $this->success([
            'message' => 'Konfigurasi quiz direset. Mau bahas topik apa?'
        ]);
    }

    public function generateSession(GenerateQuizRequest $request): JsonResponse
    {
        $conversation = AssistantConversation::find($request->conversation_id);

        $state = $this->stateStore->loadState($conversation);
        $phase = $state['phase'] ?? '';

        if (!in_array($phase, ['confirm', 'quiz_active'])) {
             throw new InvalidConversationStateException(
                 contextData: ['current_phase' => $phase, 'expected_phase' => 'confirm']
             );
        }

        $payload = $state['payload'] ?? [];
        if (empty($payload['content_id'])) {
            throw new MaterialNotFoundException(contextData: ['payload' => $payload]);
        }

        try {
            $sessionData = $this->adapter->createSession($payload, $request->user()->id);
        } catch (\Exception $e) {
            throw new QuizGenerationException(previous: $e, contextData: ['content_id' => $payload['content_id']]);
        }

        // Metrics
        $this->metricsService->recordQuizStarted($request->user()->id, $payload['content_id']);

        // Save state
        $payload['quiz_session_id'] = $sessionData['session_id'];
        $this->stateStore->saveState($conversation, [
            'phase' => 'quiz_active',
            'payload' => $payload,
        ]);

        return $this->success([
            'message' => "Quiz kamu sudah siap! Klik tombol di bawah untuk mulai.",
            'ui_type' => 'quiz_ready',
            'quiz_url' => $sessionData['quiz_url'],
            'quiz_session_id' => $sessionData['session_id'],
            'content_title' => $sessionData['content_title'],
            'question_count' => $sessionData['question_count'],
            'expires_at' => $sessionData['expires_at'],
            'cta' => [
                'label' => 'Mulai Quiz',
                'url' => $sessionData['quiz_url'],
            ]
        ]);
    }

    public function submitQuiz(SubmitQuizRequest $request, string $sessionId): JsonResponse
    {
        $conversation = AssistantConversation::find($request->conversation_id);

        $sessionOptions = $this->adapter->evaluateSession($sessionId, $request->answers, $request->user()->id);

        $analysis = $this->analyzerService->analyze($sessionId);
        
        $sessionModel = $request->quiz_session ?? $this->sessionRepository->findById($sessionId);
        $content = $sessionModel->content;
        
        $enrichedWeakTopics = $this->analyzerService->getWeakTopicsWithContent($analysis['weak_topics'], $content);
        $analysis['weak_topics'] = $enrichedWeakTopics;

        $feedbackDesc = $this->feedbackService->generateFollowUpMessage($analysis, $content);

        // check if fallback used, heuristically
        $isFallback = in_array($feedbackDesc['feedback_text'], [
            "Luar biasa! Kamu sudah menguasai materi ini dengan sangat baik.",
            "Bagus! Ada beberapa topik yang bisa diperdalam lagi.",
            "Kamu sudah berusaha! Mari review topik yang belum dikuasai.",
            "Jangan menyerah! Coba pelajari ulang materi dasarnya terlebih dahulu.",
            "Terima kasih sudah menyelesaikan quiz. Mari terus belajar!"
        ]);
        $this->metricsService->recordFeedbackGenerated($isFallback);

        $perQuestionFeedback = [];
        if ($analysis['needs_review']) {
             $perQuestionFeedback = $this->feedbackService->generatePerQuestionFeedback($sessionOptions['per_question'] ?? [], $content);
        }

        // Metrics
        $this->metricsService->recordQuizCompleted($request->user()->id, $analysis['score'], $analysis['mastery_level']);

        // Update conversation state 
        $state = $this->stateStore->loadState($conversation);
        $payload = $state['payload'] ?? [];
        $payload['last_score'] = $analysis['score'];
        $this->stateStore->saveState($conversation, [
            'phase' => 'completed',
            'payload' => $payload,
        ]);

        $structuredMsg = [
            'message' => $feedbackDesc['feedback_text'],
            'ui_type' => 'quiz_result',
            'cta_buttons' => $feedbackDesc['cta_buttons'] ?? [],
            'score' => $analysis['score'],
            'weak_topic_quiz_config' => $feedbackDesc['weak_topic_quiz_config'] ?? null,
        ];

        AssistantMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => json_encode($structuredMsg),
            'model' => 'quiz-feedback-generator',
            'latency_ms' => 0,
        ]);

        return $this->success([
            'score' => $analysis['score'],
            'accuracy' => $analysis['accuracy'],
            'mastery_level' => $analysis['mastery_level'],
            'feedback_text' => $feedbackDesc['feedback_text'],
            'per_question_feedback' => $perQuestionFeedback,
            'cta_buttons' => $feedbackDesc['cta_buttons'],
            'weak_topic_quiz_config' => $feedbackDesc['weak_topic_quiz_config'] ?? null,
            'ui_type' => 'quiz_result'
        ]);
    }

    public function showQuiz(Request $request, string $sessionId): JsonResponse
    {
        $session = $request->quiz_session ?? $this->sessionRepository->findById($sessionId);

        $isExpired = false;
        if ($session->status === 'active' && $session->started_at && $session->started_at->diffInHours(now()) > 2) {
             $isExpired = true;
        }

        $canRegenerate = false;
        if ($session->status === 'active' && $session->started_at && $session->started_at->diffInHours(now()) <= 24) {
             $canRegenerate = true;
        }

        return $this->success([
            'quiz_session_id' => $session->id,
            'status' => $isExpired ? 'expired' : $session->status,
            'can_regenerate' => $canRegenerate,
            'config' => $session->config_json ?? null,
            'questions' => $session->questions_json ?? $session->quiz->questions ?? [],
            'result_summary' => $session->resultSummary,
            'responses' => $session->responses,
            'started_at' => $session->started_at,
            'completed_at' => $session->completed_at,
        ]);
    }

    public function pauseQuiz(Request $request, string $sessionId): JsonResponse
    {
        $paused = $this->adapter->pauseSession($sessionId, $request->user()->id);

        if ($paused) {
            if ($request->has('conversation_id')) {
                $conversation = AssistantConversation::find($request->conversation_id);
                if ($conversation && $conversation->user_id === $request->user()->id) {
                    $state = $this->stateStore->loadState($conversation);
                    $payload = $state['payload'] ?? [];
                    $payload['paused_session_id'] = $sessionId;
                    
                    $this->stateStore->saveState($conversation, [
                        'phase' => $state['phase'] ?? 'quiz_active',
                        'payload' => $payload,
                    ]);
                }
            }
            return $this->success(['message' => 'Quiz di-pause']);
        }

        return $this->error('Gagal me-pause quiz', 400);
    }

    public function resumeQuiz(Request $request, string $sessionId): JsonResponse
    {
        $resumedData = $this->adapter->resumeSession($sessionId, $request->user()->id);

        if ($resumedData) {
            return $this->success([
                'message' => 'Melanjutkan quiz...',
                'quiz_url' => $resumedData['quiz_url'],
                'session_data' => $resumedData
            ]);
        }

        return $this->error('Sesi quiz sudah expired atau tidak valid.', 400, [
            'options' => [
                ['label' => 'Mulai quiz baru', 'action' => 'reset_config']
            ]
        ]);
    }
}
