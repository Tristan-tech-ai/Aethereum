<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistantConversation;
use App\Models\AssistantPreference;
use App\Services\AssistantOrchestratorService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AssistantOrchestratorService $orchestrator,
    ) {}

    // ─── Conversations ────────────────────────────────────────────────────

    /**
     * GET /v1/assistant/conversations
     * List all conversations for the authenticated user.
     */
    public function conversations(Request $request): JsonResponse
    {
        $conversations = AssistantConversation::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get(['id', 'title', 'context_type', 'status', 'updated_at']);

        return $this->success($conversations);
    }

    /**
     * GET /v1/assistant/conversations/{id}
     * Retrieve a single conversation with all messages.
     */
    public function showConversation(Request $request, string $id): JsonResponse
    {
        $conversation = AssistantConversation::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('messages')
            ->firstOrFail();

        // Parse assistant message content from JSON where possible
        $conversation->messages->transform(function ($msg) {
            if ($msg->role === 'assistant') {
                $decoded = json_decode($msg->content, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($decoded['message'])) {
                    $msg->structured = $decoded;
                } else {
                    // Legacy plain-text message
                    $msg->structured = [
                        'message' => $msg->content,
                        'sections' => [],
                        'cta' => [],
                        'user_data' => ['show' => false, 'metrics' => []],
                    ];
                }
            }
            return $msg;
        });

        return $this->success($conversation);
    }

    /**
     * DELETE /v1/assistant/conversations/{id}
     * Delete a conversation and its messages.
     */
    public function deleteConversation(Request $request, string $id): JsonResponse
    {
        $conversation = AssistantConversation::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $conversation->delete();

        return $this->success(null, 'Conversation deleted');
    }

    // ─── Chat ─────────────────────────────────────────────────────────────

    /**
     * POST /v1/assistant/chat
     * Start a new conversation or continue an existing one with a message.
     */
    public function chat(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'message'         => 'required|string|max:2000',
                'conversation_id' => 'nullable|uuid',
                'context_type'    => 'nullable|string|in:general,session,content,profile,study_plan',
                'context_id'      => 'nullable|string', // can be uuid or other ID
            ]);

            $user = $request->user();

            // Resolve or create conversation
            if ($request->conversation_id) {
                $conversation = AssistantConversation::where('id', $request->conversation_id)
                    ->where('user_id', $user->id)
                    ->firstOrFail();
            } else {
                $conversation = AssistantConversation::create([
                    'user_id'       => $user->id,
                    'context_type'  => $request->input('context_type', 'general'),
                    'context_id'    => $request->context_id,
                ]);
            }

            $result = $this->orchestrator->chat($conversation, $request->message);

            return $this->success([
                'conversation_id' => $conversation->id,
                'title'           => $conversation->fresh()->title ?? 'Conversation',
                'reply'           => $result['structured'],
                'latency_ms'      => $result['message']->latency_ms ?? 0,
                'phase'           => $result['structured']['phase'] ?? 'general',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Assistant Controller Chat Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal: ' . $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }


    // ─── Study Plan ───────────────────────────────────────────────────────

    /**
     * POST /v1/assistant/study-plan/generate
     * Generate a personalised study plan.
     */
    public function generateStudyPlan(Request $request): JsonResponse
    {
        $request->validate([
            'goal'           => 'required|string|max:300',
            'duration_days'  => 'required|integer|min:1|max:30',
            'daily_minutes'  => 'required|integer|min:10|max:480',
        ]);

        $plan = $this->orchestrator->generateStudyPlan(
            $request->user(),
            $request->goal,
            (int) $request->duration_days,
            (int) $request->daily_minutes
        );

        return $this->success(['plan' => $plan]);
    }

    // ─── Reflection ───────────────────────────────────────────────────────

    /**
     * POST /v1/assistant/reflection
     * Get a progress reflection for the authenticated user.
     */
    public function reflection(Request $request): JsonResponse
    {
        $reflection = $this->orchestrator->reflect($request->user());

        return $this->success(['reflection' => $reflection]);
    }

    // ─── Preferences ──────────────────────────────────────────────────────

    /**
     * GET /v1/assistant/preferences
     */
    public function getPreferences(Request $request): JsonResponse
    {
        $prefs = AssistantPreference::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['tone' => 'friendly', 'language' => 'auto', 'goal_style' => 'task']
        );

        return $this->success($prefs);
    }

    /**
     * PATCH /v1/assistant/preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'tone'                => 'nullable|string|in:friendly,strict,motivational',
            'language'            => 'nullable|string|in:auto,id,en',
            'goal_style'          => 'nullable|string|in:task,milestone,habit',
            'notification_opt_in' => 'nullable|boolean',
        ]);

        $prefs = AssistantPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->only(['tone', 'language', 'goal_style', 'notification_opt_in'])
        );

        return $this->success($prefs);
    }
}
