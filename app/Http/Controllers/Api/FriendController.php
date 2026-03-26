<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    use ApiResponse;

    public function request(Request $request, string $username): JsonResponse
    {
        $user = $request->user();
        $targetUser = User::where('username', $username)->firstOrFail();

        if ($user->id === $targetUser->id) {
            return $this->error('Cannot send friend request to yourself', 400);
        }

        // Check if existing request
        $existing = Friendship::where(function($q) use ($user, $targetUser) {
            $q->where('requester_id', $user->id)->where('addressee_id', $targetUser->id);
        })->orWhere(function($q) use ($user, $targetUser) {
            $q->where('requester_id', $targetUser->id)->where('addressee_id', $user->id);
        })->first();

        if ($existing) {
            return $this->error("Friendship status is already: {$existing->status}", 400);
        }

        $friendship = Friendship::create([
            'requester_id' => $user->id,
            'addressee_id' => $targetUser->id,
            'status' => 'pending',
        ]);

        return $this->success(['friendship' => $friendship], 'Friend request sent');
    }

    public function accept(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        // Find friendship where the current user is the addressee receiving the request
        $friendship = Friendship::where('id', $id)
            ->where('addressee_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return $this->success(['friendship' => $friendship], 'Friend request accepted');
    }

    public function decline(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $friendship = Friendship::where('id', $id)
            ->where('addressee_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->delete();

        return $this->success(null, 'Friend request declined');
    }

    public function remove(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        // Find accepted friendship involving this user
        $friendship = Friendship::where('id', $id)
            ->where('status', 'accepted')
            ->where(function($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('addressee_id', $user->id);
            })
            ->firstOrFail();

        $friendship->delete();

        return $this->success(null, 'Friend removed from list');
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get friends mapping
        $friendships = Friendship::where('status', 'accepted')
            ->where(function($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('addressee_id', $user->id);
            })
            ->with(['requester', 'addressee'])
            ->get();

        $friends = $friendships->map(function ($f) use ($user) {
            return $f->requester_id === $user->id ? $f->addressee : $f->requester;
        })->filter()->map(function ($friend) {
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'username' => $friend->username,
                'avatar_url' => $friend->avatar_url,
                'level' => $friend->level,
                'rank' => $friend->rank,
                'is_learning_now' => $friend->is_learning_now ?? false,
            ];
        })->values();

        return $this->success(['friends' => $friends], 'Friends retrieved');
    }

    public function requests(Request $request): JsonResponse
    {
        $user = $request->user();

        // Requests sent TO me
        $incoming = Friendship::where('addressee_id', $user->id)
            ->where('status', 'pending')
            ->with('requester:id,name,username,avatar_url,level')
            ->get();

        // Requests sent BY me
        $outgoing = Friendship::where('requester_id', $user->id)
            ->where('status', 'pending')
            ->with('addressee:id,name,username,avatar_url,level')
            ->get();

        return $this->success([
            'incoming' => $incoming,
            'outgoing' => $outgoing
        ], 'Friend requests retrieved');
    }
}
