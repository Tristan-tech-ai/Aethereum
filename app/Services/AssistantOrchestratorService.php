<?php

namespace App\Services;

use App\Models\AssistantConversation;
use App\Models\AssistantMessage;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\User;
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
