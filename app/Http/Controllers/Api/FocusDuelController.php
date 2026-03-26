<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FocusDuel;
use App\Models\Friendship;
use App\Models\User;
use App\Services\FocusDuelService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FocusDuelController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected FocusDuelService $duelService,
    ) {}

    public function challenge(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'nullable|string|exists:users,username',
            'opponent_id' => 'nullable|uuid|exists:users,id',
            'duration_minutes' => 'required|integer|min:5|max:120',
        ]);

        if (!$request->username && !$request->opponent_id) {
            return $this->error('username or opponent_id is required', 422);
        }

        $user = $request->user();
        $opponent = $request->opponent_id
            ? User::findOrFail($request->opponent_id)
            : User::where('username', $request->username)->firstOrFail();

        if ($user->id === $opponent->id) {
            return $this->error('Cannot challenge yourself', 400);
        }

        // Verify friendship
        $isFriend = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($user, $opponent) {
                $q->where(function ($q2) use ($user, $opponent) {
                    $q2->where('requester_id', $user->id)->where('addressee_id', $opponent->id);
                })->orWhere(function ($q2) use ($user, $opponent) {
                    $q2->where('requester_id', $opponent->id)->where('addressee_id', $user->id);
                });
            })->exists();

        if (!$isFriend) {
            return $this->error('You can only challenge friends', 400);
        }

        $duel = FocusDuel::create([
            'challenger_id' => $user->id,
            'opponent_id' => $opponent->id,
            'duration_minutes' => $request->duration_minutes,
            'status' => 'pending',
            'expires_at' => now()->addHours(24),
        ]);

        return $this->success([
            'duel' => $duel->load(['challenger', 'opponent']),
        ], 'Challenge sent', 201);
    }

    public function accept(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $duel = FocusDuel::where('id', $id)
            ->where('opponent_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $duel->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return $this->success(['duel' => $duel->fresh()->load(['challenger', 'opponent'])], 'Challenge accepted');
    }

    public function decline(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $duel = FocusDuel::where('id', $id)
            ->where('opponent_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $duel->update(['status' => 'declined']);

        return $this->success(null, 'Challenge declined');
    }

    public function start(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $duel = FocusDuel::where('id', $id)
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->firstOrFail();

        $duel->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return $this->success(['duel' => $duel->fresh()->load(['challenger', 'opponent'])], 'Duel started');
    }

    public function focusEvent(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'event_type' => 'required|in:tab_switch,tab_restored',
        ]);

        $user = $request->user();
        $duel = FocusDuel::where('id', $id)
            ->where('status', 'active')
            ->where(function ($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->firstOrFail();

        // Track distraction count (stored in a simple way via focus_integrity field)
        $this->duelService->broadcastFocusEvent($duel->id, $request->event_type, 0);

        return $this->success(null, 'Focus event recorded');
    }

    public function complete(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'focus_integrity' => 'required|numeric|min:0|max:100',
        ]);

        $user = $request->user();
        $duel = FocusDuel::where('id', $id)
            ->where('status', 'active')
            ->where(function ($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->firstOrFail();

        // Update the correct player's focus integrity
        if ($duel->challenger_id === $user->id) {
            $duel->update(['challenger_focus_integrity' => $request->focus_integrity]);
        } else {
            $duel->update(['opponent_focus_integrity' => $request->focus_integrity]);
        }

        $duel->refresh();

        // Check if both players have submitted
        if ($duel->challenger_focus_integrity !== null && $duel->opponent_focus_integrity !== null) {
            $this->duelService->completeDuel($duel);
        }

        return $this->success([
            'duel' => $duel->load(['challenger', 'opponent', 'winner']),
        ], 'Score submitted');
    }

    public function myDuels(Request $request): JsonResponse
    {
        $user = $request->user();

        $duels = FocusDuel::where(function ($q) use ($user) {
                $q->where('challenger_id', $user->id)->orWhere('opponent_id', $user->id);
            })
            ->with(['challenger:id,name,username,avatar_url', 'opponent:id,name,username,avatar_url'])
            ->latest()
            ->limit(20)
            ->get();

        return $this->success(['duels' => $duels]);
    }
}
