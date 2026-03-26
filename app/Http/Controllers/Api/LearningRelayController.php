<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningContent;
use App\Models\LearningRelay;
use App\Services\LearningRelayService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningRelayController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected LearningRelayService $relayService,
    ) {}

    public function my(Request $request): JsonResponse
    {
        $user = $request->user();
        $relays = LearningRelay::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with(['creator', 'content', 'participants'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return $this->success($relays);
    }

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'content_id' => 'required|uuid|exists:learning_contents,id',
            'max_participants' => 'integer|min:2|max:7',
        ]);

        $user = $request->user();
        $content = LearningContent::where('id', $request->content_id)
            ->where('status', 'ready')
            ->firstOrFail();

        $maxParticipants = $request->input('max_participants', 4);

        // Split content into sections
        $extractedText = $content->extracted_text ?? '';
        $sections = $this->relayService->splitContentIntoSections($extractedText, $maxParticipants);

        $relay = LearningRelay::create([
            'creator_id' => $user->id,
            'content_id' => $content->id,
            'invite_code' => $this->relayService->generateInviteCode(),
            'max_participants' => $maxParticipants,
            'status' => 'lobby',
        ]);

        // Creator auto-joins with section 0
        $relay->participants()->attach($user->id, [
            'section_index' => 0,
            'section_content' => $sections[0] ?? '',
            'section_completed' => false,
        ]);

        return $this->success([
            'relay' => $relay->load('participants', 'content'),
            'section_count' => count($sections),
        ], 'Learning relay created', 201);
    }

    public function join(Request $request): JsonResponse
    {
        $request->validate([
            'invite_code' => 'required|string',
        ]);

        $user = $request->user();
        $relay = LearningRelay::where('invite_code', $request->invite_code)
            ->where('status', 'lobby')
            ->firstOrFail();

        if ($relay->participants()->count() >= $relay->max_participants) {
            return $this->error('Relay is full', 400);
        }

        if ($relay->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('Already joined this relay', 400);
        }

        $sectionIndex = $relay->participants()->count();
        $content = $relay->content;
        $sections = $this->relayService->splitContentIntoSections(
            $content->extracted_text ?? '',
            $relay->max_participants
        );

        $relay->participants()->attach($user->id, [
            'section_index' => $sectionIndex,
            'section_content' => $sections[$sectionIndex] ?? '',
            'section_completed' => false,
        ]);

        return $this->success([
            'relay' => $relay->load('participants', 'content'),
            'assigned_section' => $sectionIndex,
        ], 'Joined relay');
    }

    public function start(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $relay = LearningRelay::findOrFail($id);

        if ($relay->creator_id !== $user->id) {
            return $this->error('Only the creator can start', 403);
        }

        if ($relay->status !== 'lobby') {
            return $this->error('Relay is not in lobby', 400);
        }

        if ($relay->participants()->count() < 2) {
            return $this->error('Need at least 2 participants', 400);
        }

        $relay->update(['status' => 'active']);

        return $this->success(['relay' => $relay->fresh()->load('participants')], 'Relay started');
    }

    public function submitSummary(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'summary' => 'required|string|min:50|max:5000',
        ]);

        $user = $request->user();
        $relay = LearningRelay::where('id', $id)
            ->whereIn('status', ['active', 'summary'])
            ->firstOrFail();

        $relay->participants()->updateExistingPivot($user->id, [
            'section_summary' => $request->summary,
            'section_completed' => true,
        ]);

        // Check if all summaries are in
        $allComplete = $this->relayService->checkAllSummariesComplete($relay->fresh());

        if ($allComplete) {
            $relay->update(['status' => 'quiz']);
        }

        return $this->success([
            'all_summaries_complete' => $allComplete,
        ], 'Summary submitted');
    }

    public function submitQuiz(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'score' => 'required|numeric|min:0|max:100',
        ]);

        $user = $request->user();
        $relay = LearningRelay::where('id', $id)
            ->where('status', 'quiz')
            ->firstOrFail();

        $relay->participants()->updateExistingPivot($user->id, [
            'quiz_score' => $request->score,
        ]);

        // Check if all quiz scores are in
        $allQuizzed = $relay->fresh()->participants()
            ->wherePivotNull('quiz_score')
            ->count() === 0;

        if ($allQuizzed) {
            $this->relayService->completeRelay($relay->fresh());
        }

        return $this->success([
            'all_quizzed' => $allQuizzed,
        ], 'Quiz score submitted');
    }

    public function results(Request $request, string $id): JsonResponse
    {
        $relay = LearningRelay::with(['participants', 'content'])->findOrFail($id);

        $participants = $relay->participants->map(fn ($p) => [
            'user_id' => $p->id,
            'name' => $p->name,
            'avatar_url' => $p->avatar_url,
            'section_index' => $p->pivot->section_index,
            'section_completed' => $p->pivot->section_completed,
            'quiz_score' => $p->pivot->quiz_score,
            'xp_earned' => $p->pivot->xp_earned,
            'coins_earned' => $p->pivot->coins_earned,
        ]);

        return $this->success([
            'relay' => $relay,
            'combined_summary' => $relay->combined_summary,
            'participants' => $participants,
        ]);
    }
}
