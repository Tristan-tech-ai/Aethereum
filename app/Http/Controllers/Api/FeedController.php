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
        $perPage = max(5, min(30, (int) $request->input('per_page', 15)));

        $audienceUserIds = $this->audienceUserIds($user->id);

        $feed = FeedEvent::with('user:id,name,username,avatar_url,level')
            ->whereIn('user_id', $audienceUserIds)
            ->where('is_public', true)
            ->latest()
            ->paginate($perPage);

        $eventIds = $feed->getCollection()->pluck('id')->all();
        $likedIds = DB::table('feed_likes')
            ->where('user_id', $user->id)
            ->whereIn('event_id', $eventIds)
            ->pluck('event_id')
            ->flip();

        $feed->getCollection()->transform(function (FeedEvent $event) use ($likedIds) {
            $event->liked_by_me = $likedIds->has($event->id);
            return $event;
        });

        return $this->success(['feed' => $feed], 'Feed retrieved successfully');
    }

    public function toggleLike(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $feedEvent = FeedEvent::findOrFail($id);

        $audienceUserIds = $this->audienceUserIds($user->id);
        if (!in_array($feedEvent->user_id, $audienceUserIds, true) || !$feedEvent->is_public) {
            return $this->error('You cannot interact with this feed event', 403);
        }

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

    private function audienceUserIds(string $userId): array
    {
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_id', $userId)
                    ->orWhere('addressee_id', $userId);
            })
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->requester_id === $userId
                    ? $friendship->addressee_id
                    : $friendship->requester_id;
            })
            ->toArray();

        $friendIds[] = $userId;

        return array_values(array_unique($friendIds));
    }
}
