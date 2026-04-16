<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningContent;
use App\Models\StudyRaid;
use App\Services\StudyRaidService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyRaidController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected StudyRaidService $raidService,
    ) {}

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'content_id' => 'required|uuid|exists:learning_contents,id',
            'max_participants' => 'integer|min:2|max:7',
            'duration_minutes' => 'nullable|integer|min:10|max:180',
        ]);

        $user = $request->user();
        $content = LearningContent::where('id', $request->content_id)
            ->where('user_id', $user->id)
            ->where('status', 'ready')
            ->firstOrFail();

        $raid = StudyRaid::create([
            'creator_id' => $user->id,
            'content_id' => $content->id,
            'invite_code' => $this->raidService->generateInviteCode(),
            'max_participants' => $request->input('max_participants', 5),
            'duration_minutes' => $request->duration_minutes,
            'status' => 'lobby',
        ]);

        // Creator auto-joins
        $raid->participants()->attach($user->id, [
            'role' => 'leader',
            'status' => 'joined',
            'joined_at' => now(),
        ]);

        return $this->success([
            'raid' => $raid->load('participants', 'content'),
        ], 'Study raid created', 201);
    }

    public function join(Request $request): JsonResponse
    {
        $request->validate([
            'invite_code' => 'required|string',
        ]);

        $user = $request->user();
        $raid = StudyRaid::where('invite_code', $request->invite_code)
            ->where('status', 'lobby')
            ->firstOrFail();

        if ($raid->participants()->count() >= $raid->max_participants) {
            return $this->error('Raid is full', 400);
        }

        if ($raid->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('Already joined this raid', 400);
        }

        $raid->participants()->attach($user->id, [
            'role' => 'member',
            'status' => 'joined',
            'joined_at' => now(),
        ]);

        return $this->success([
            'raid' => $raid->load('participants', 'content'),
        ], 'Joined raid successfully');
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $raid = StudyRaid::with(['participants', 'content', 'creator'])->findOrFail($id);

        return $this->success(['raid' => $raid]);
    }

    public function start(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $raid = StudyRaid::findOrFail($id);

        if ($raid->creator_id !== $user->id) {
            return $this->error('Only the creator can start the raid', 403);
        }

        if ($raid->status !== 'lobby') {
            return $this->error('Raid is not in lobby state', 400);
        }

        if ($raid->participants()->count() < 2) {
            return $this->error('Need at least 2 participants', 400);
        }

        $raid->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return $this->success(['raid' => $raid->fresh()->load('participants')], 'Raid started');
    }

    public function updateProgress(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'progress_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $user = $request->user();
        $raid = StudyRaid::where('id', $id)->where('status', 'active')->firstOrFail();

        $raid->participants()->updateExistingPivot($user->id, [
            'progress_percentage' => $request->progress_percentage,
        ]);

        $this->raidService->broadcastProgress($raid->id, $user->id, $request->progress_percentage);

        return $this->success(['progress' => $request->progress_percentage], 'Progress updated');
    }

    public function quizComplete(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'quiz_score' => 'required|numeric|min:0|max:100',
        ]);

        $user = $request->user();
        $raid = StudyRaid::where('id', $id)->where('status', 'active')->firstOrFail();

        $raid->participants()->updateExistingPivot($user->id, [
            'quiz_score' => $request->quiz_score,
        ]);

        return $this->success(null, 'Quiz score recorded');
    }

    public function complete(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $raid = StudyRaid::where('id', $id)->where('status', 'active')->firstOrFail();

        $raid->participants()->updateExistingPivot($user->id, [
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Check if all participants completed
        $allDone = $raid->participants()->wherePivot('status', '!=', 'completed')->count() === 0;

        if ($allDone) {
            $this->raidService->completeRaid($raid);
        }

        return $this->success(['all_completed' => $allDone], 'Marked as complete');
    }

    public function results(Request $request, string $id): JsonResponse
    {
        $raid = StudyRaid::with(['participants', 'content'])->findOrFail($id);

        $results = $raid->participants->map(fn ($p) => [
            'user_id' => $p->id,
            'name' => $p->name,
            'avatar_url' => $p->avatar_url,
            'progress_percentage' => $p->pivot->progress_percentage,
            'quiz_score' => $p->pivot->quiz_score,
            'xp_earned' => $p->pivot->xp_earned,
            'coins_earned' => $p->pivot->coins_earned,
        ]);

        return $this->success([
            'raid' => $raid,
            'team_score' => $raid->team_score,
            'participants' => $results,
        ]);
    }

    public function myRaids(Request $request): JsonResponse
    {
        $user = $request->user();

        $raids = StudyRaid::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with(['content:id,title,subject', 'creator:id,name,username,avatar_url'])
            ->latest()
            ->paginate(10);

        return $this->success(['raids' => $raids]);
    }
}
