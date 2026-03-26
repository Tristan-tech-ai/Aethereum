<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningContent;
use App\Models\QuizArena;
use App\Services\QuizArenaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizArenaController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected QuizArenaService $arenaService,
    ) {}

    public function my(Request $request): JsonResponse
    {
        $user = $request->user();
        $arenas = QuizArena::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with(['host', 'content', 'participants'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return $this->success($arenas);
    }

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'content_id' => 'required|uuid|exists:learning_contents,id',
            'max_players' => 'integer|min:2|max:10',
            'question_count' => 'integer|min:5|max:30',
            'time_per_question' => 'integer|min:10|max:60',
        ]);

        $user = $request->user();
        $content = LearningContent::where('id', $request->content_id)
            ->where('status', 'ready')
            ->firstOrFail();

        $arena = QuizArena::create([
            'host_id' => $user->id,
            'content_id' => $content->id,
            'room_code' => $this->arenaService->generateRoomCode(),
            'max_players' => $request->input('max_players', 5),
            'question_count' => $request->input('question_count', 10),
            'time_per_question' => $request->input('time_per_question', 30),
            'status' => 'lobby',
        ]);

        // Host auto-joins
        $arena->participants()->attach($user->id);

        return $this->success([
            'arena' => $arena->load('participants', 'content'),
        ], 'Quiz arena created', 201);
    }

    public function join(Request $request): JsonResponse
    {
        $request->validate([
            'room_code' => 'required|string',
        ]);

        $user = $request->user();
        $arena = QuizArena::where('room_code', $request->room_code)
            ->where('status', 'lobby')
            ->firstOrFail();

        if ($arena->participants()->count() >= $arena->max_players) {
            return $this->error('Arena is full', 400);
        }

        if ($arena->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('Already joined this arena', 400);
        }

        $arena->participants()->attach($user->id);

        return $this->success([
            'arena' => $arena->load('participants', 'content'),
        ], 'Joined arena');
    }

    public function start(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $arena = QuizArena::findOrFail($id);

        if ($arena->host_id !== $user->id) {
            return $this->error('Only the host can start', 403);
        }

        if ($arena->status !== 'lobby') {
            return $this->error('Arena is not in lobby', 400);
        }

        if ($arena->participants()->count() < 2) {
            return $this->error('Need at least 2 players', 400);
        }

        $arena->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return $this->success(['arena' => $arena->fresh()->load('participants')], 'Arena started');
    }

    public function answer(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'question_index' => 'required|integer|min:0',
            'answer' => 'required|string',
            'correct' => 'required|boolean',
            'response_time_ms' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        $arena = QuizArena::where('id', $id)->where('status', 'active')->firstOrFail();

        $score = $this->arenaService->calculateScore(
            $request->correct,
            $request->response_time_ms,
            $arena->time_per_question * 1000,
        );

        // Update participant score
        $currentScore = $arena->participants()
            ->where('user_id', $user->id)
            ->first()?->pivot->total_score ?? 0;

        $currentCorrect = $arena->participants()
            ->where('user_id', $user->id)
            ->first()?->pivot->correct_answers ?? 0;

        $arena->participants()->updateExistingPivot($user->id, [
            'total_score' => $currentScore + $score,
            'correct_answers' => $currentCorrect + ($request->correct ? 1 : 0),
        ]);

        // Broadcast score update
        $allScores = $arena->participants()->orderByPivot('total_score', 'desc')->get()->map(fn ($p) => [
            'user_id' => $p->id,
            'name' => $p->name,
            'total_score' => $p->pivot->total_score,
            'correct_answers' => $p->pivot->correct_answers,
        ])->toArray();

        $this->arenaService->broadcastScoreUpdate($arena->id, $allScores);

        return $this->success([
            'score_earned' => $score,
            'total_score' => $currentScore + $score,
        ], 'Answer submitted');
    }

    public function results(Request $request, string $id): JsonResponse
    {
        $arena = QuizArena::with(['participants' => fn ($q) => $q->orderByPivot('total_score', 'desc'), 'content'])
            ->findOrFail($id);

        $podium = $arena->participants->map(fn ($p, $i) => [
            'rank' => $i + 1,
            'user_id' => $p->id,
            'name' => $p->name,
            'avatar_url' => $p->avatar_url,
            'total_score' => $p->pivot->total_score,
            'correct_answers' => $p->pivot->correct_answers,
            'xp_earned' => $p->pivot->xp_earned,
            'coins_earned' => $p->pivot->coins_earned,
        ]);

        return $this->success([
            'arena' => $arena,
            'podium' => $podium,
        ]);
    }
}
