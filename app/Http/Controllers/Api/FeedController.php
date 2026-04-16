<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedEvent;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get friend IDs
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('addressee_id', $user->id);
            })
            ->get()
            ->map(function ($friendship) use ($user) {
                return $friendship->requester_id === $user->id ? $friendship->addressee_id : $friendship->requester_id;
            })
            ->toArray();

        // Add self to see own events
        $friendIds[] = $user->id;

        // Fetch feed events for friends, self, and prominent global events (optional)
        // For now, we mix friends + self. In a real app, global events could be mixed in by checking 'is_global' etc.
        $feed = FeedEvent::with('user:id,name,username,avatar_url,level')
            ->whereIn('user_id', $friendIds)
            ->latest()
            ->paginate(15);

        return $this->success(['feed' => $feed], 'Feed retrieved successfully');
    }

    public function toggleLike(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $feedEvent = FeedEvent::findOrFail($id);

        $existingLike = DB::table('feed_likes')
            ->where('event_id', $feedEvent->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            DB::table('feed_likes')
                ->where('event_id', $feedEvent->id)
                ->where('user_id', $user->id)
                ->delete();
            $feedEvent->decrement('likes');
            $action = 'unliked';
        } else {
            DB::table('feed_likes')->insert([
                'event_id' => $feedEvent->id,
                'user_id' => $user->id,
            ]);
            $feedEvent->increment('likes');
            $action = 'liked';
        }

        return $this->success([
            'action' => $action,
            'feed_event_id' => $feedEvent->id,
            'likes' => $feedEvent->fresh()->likes
        ], "Feed event $action successfully");
    }
}
