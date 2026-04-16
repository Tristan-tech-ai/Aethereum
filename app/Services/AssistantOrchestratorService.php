<?php

namespace App\Services;

use App\Models\AssistantConversation;
use App\Models\AssistantMessage;
use App\Models\LearningSession;
use App\Models\User;
use App\Services\AssistantConversationStateStoreService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Top-level orchestrator for all Nexera Assistant interactions.
 */
class AssistantOrchestratorService
{
    public function __construct(
        protected GeminiService $gemini,
        protected AssistantContextService $contextService,
        protected AssistantPromptBuilderService $promptBuilder,
        protected AssistantConversationStateStoreService $stateStore,
        protected QuizConfigurationFlowService $configFlow,
        protected QuizIntentDetectorService $intentDetector,
    ) {}

    /**
     * Handle a chat message inside a conversation.
     * Returns the assistant's reply as structured data.
     */
    public function chat(
        AssistantConversation $conversation,
        string $userMessage
    ): array {
        $user = $conversation->user;

        // Build context
        $userContext = $this->contextService->buildUserContext($user);
        $history     = $this->contextService->buildConversationHistory($conversation, 4);
        $conversationState = $this->stateStore->loadState($conversation);

        $statePhase = $conversationState['phase'] ?? 'general';

        if ($statePhase !== 'general') {
            return $this->handleQuizFlow($conversation, $user, $userMessage, $conversationState, $statePhase);
        }

        if ($this->intentDetector->detect($userMessage) === 'quiz_request') {
            $initialState = ['phase' => 'intent', 'payload' => []];
            return $this->handleQuizFlow($conversation, $user, $userMessage, $initialState, 'intent');
        }

        // Determine if user is in an active session — use session coach if so
        $activeSession = LearningSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if ($activeSession && $conversation->context_type === 'session') {
            $sessionContext = $this->contextService->buildSessionContext($activeSession);
            $prompt = $this->promptBuilder->buildSessionCoachPrompt(
                $userMessage, $userContext, $sessionContext
            );
        } else {
            $prompt = $this->promptBuilder->buildChatPrompt(
                $userMessage, $userContext, $history
            );
        }

        // Save user message
        AssistantMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        // Call Gemini with structured JSON response
        $start = microtime(true);
        try {
            $result = $this->gemini->callChat($prompt, 0.7, 2048);
            $structured = $result['data'];
            $promptTokens = $result['usage']['prompt_tokens'] ?? null;
            $completionTokens = $result['usage']['completion_tokens'] ?? null;
        } catch (RuntimeException $e) {
            Log::error('Nexera Assistant chat error', [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            $isQuota = str_contains($e->getMessage(), 'kuota') || str_contains($e->getMessage(), '429');
            $errorMsg = $isQuota
                ? 'Maaf, kuota AI harian sudah tercapai. Coba lagi nanti ya! 🙏'
                : 'Maaf, Nexera Assistant sedang mengalami gangguan teknis. Coba lagi dalam beberapa saat ya!';

            $structured = [
                'message' => $errorMsg,
                'sections' => [],
                'cta' => [],
                'user_data' => ['show' => false, 'metrics' => []],
            ];
            $promptTokens = null;
            $completionTokens = null;
        }

        $latencyMs = (int) ((microtime(true) - $start) * 1000);

        // Normalise structure
        $structured['message']   = $structured['message'] ?? '';
        $structured['sections']  = $structured['sections'] ?? [];
        $structured['cta']       = $structured['cta'] ?? [];
        $structured['user_data'] = $structured['user_data'] ?? ['show' => false, 'metrics' => []];

        // Save conversation state for recovery and context persistence
        $this->stateStore->saveState($conversation, [
            'last_user_message' => $userMessage,
            'last_assistant_message' => $structured['message'],
            'last_updated_at' => now()->toIso8601String(),
            'conversation_state' => $conversationState,
        ]);

        // Auto-title conversation on first exchange
        if ($conversation->messages()->count() <= 1 && empty($conversation->title)) {
            $conversation->update([
                'title' => Str::limit($userMessage, 50),
            ]);
        }

        // Save assistant message (store full JSON)
        $assistantMessage = AssistantMessage::create([
            'conversation_id'   => $conversation->id,
            'role'               => 'assistant',
            'content'            => json_encode($structured),
            'model'              => 'gemini-2.0-flash',
            'prompt_tokens'      => $promptTokens,
            'completion_tokens'  => $completionTokens,
            'latency_ms'         => $latencyMs,
        ]);

        return [
            'structured' => $structured,
            'message'    => $assistantMessage,
        ];
    }

    private function handleQuizFlow(AssistantConversation $conversation, User $user, string $userMessage, array $conversationState, string $statePhase): array
    {
        AssistantMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        try {
            $flowResponse = match ($statePhase) {
                'intent'     => $this->configFlow->handleIntent($conversationState, $userMessage, $user->id),
                'material'   => $this->configFlow->handleMaterial($conversationState, $userMessage, $user->id),
                'section'    => $this->configFlow->handleSection($conversationState, $userMessage),
                'count'      => $this->configFlow->handleCount($conversationState, $userMessage),
                'type'       => $this->configFlow->handleType($conversationState, $userMessage),
                'difficulty' => $this->configFlow->handleDifficulty($conversationState, $userMessage),
                'confirm'    => $this->configFlow->handleConfirm($conversationState, $userMessage),
                default      => ['message' => 'Terjadi kesalahan konfigurasi.', 'next_phase' => 'general', 'ui_type' => 'text', 'options' => null, 'payload_update' => [], 'is_terminal' => true],
            };
        } catch (\Exception $e) {
            Log::error('Quiz Flow Error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'phase' => $statePhase,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        $newPayload = array_merge($conversationState['payload'] ?? [], $flowResponse['payload_update'] ?? []);
        $newState = [
            'phase' => $flowResponse['next_phase'],
            'payload' => $newPayload,
        ];

        $this->stateStore->saveState($conversation, $newState);

        // Auto-title conversation on first exchange
        if ($conversation->messages()->count() <= 1 && empty($conversation->title)) {
            $conversation->update([
                'title' => Str::limit($userMessage, 50) ?: 'Latihan Soal',
            ]);
        }

        $structured = [
            'message' => $flowResponse['message'],
            'ui_type' => $flowResponse['ui_type'],
            'cta'     => $flowResponse['cta'] ?? [],
            'phase'   => $flowResponse['next_phase'],
            'payload' => $newPayload, // Pass payload to controller so it can create quiz session if terminal
        ];


        $assistantMessage = AssistantMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'assistant',
            'content'         => json_encode($structured),
            'model'           => 'quiz-flow-rule',
            'latency_ms'      => 0,
        ]);

        return [
            'is_flow'    => true,
            'structured' => $structured,
            'message'    => $assistantMessage,
        ];
    }

    /**
     * Generate a personalised study plan and save it as a conversation.
     */
    public function generateStudyPlan(
        User $user,
        string $goal,
        int $durationDays,
        int $dailyMinutes
    ): array {
        $userContext  = $this->contextService->buildUserContext($user);
        $contentList  = $this->contextService->getUserContentList($user);
        $prompt = $this->promptBuilder->buildStudyPlanPrompt(
            $user, $goal, $durationDays, $dailyMinutes, $userContext, $contentList
        );

        $start = microtime(true);
        try {
            $plan = $this->gemini->call($prompt, 0.6, 3000);
        } catch (RuntimeException $e) {
            throw new RuntimeException('Gagal membuat rencana belajar: ' . $e->getMessage());
        }
        $latencyMs = (int) ((microtime(true) - $start) * 1000);

        // Persist as a conversation for history
        $conversation = AssistantConversation::create([
            'user_id'       => $user->id,
            'title'         => 'Study Plan: ' . Str::limit($goal, 40),
            'context_type'  => 'study_plan',
        ]);

        AssistantMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'user',
            'content'         => "Generate study plan: {$goal} ({$durationDays} days, {$dailyMinutes}min/day)",
        ]);

        AssistantMessage::create([
            'conversation_id'  => $conversation->id,
            'role'             => 'assistant',
            'content'          => json_encode($plan),
            'model'            => 'gemini-2.0-flash',
            'latency_ms'       => $latencyMs,
        ]);

        return $plan;
    }

    /**
     * Generate a progress reflection for the user.
     */
    public function reflect(User $user): string
    {
        $userContext = $this->contextService->buildUserContext($user);
        $prompt      = $this->promptBuilder->buildReflectionPrompt($userContext);

        try {
            $raw = $this->gemini->callRaw($prompt, 0.6, 1024);
            return $raw['text'];
        } catch (RuntimeException $e) {
            throw new RuntimeException('Gagal membuat refleksi: ' . $e->getMessage());
        }
    }
}
