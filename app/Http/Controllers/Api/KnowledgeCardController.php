<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeCard;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KnowledgeCardController extends Controller
{
    use ApiResponse;

    /**
     * Get details of a specific knowledge card.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $card = KnowledgeCard::with(['user:id,name,username,avatar_url', 'learningContent'])
            ->findOrFail($id);

        // Optional: Ensure private profiles can't have their cards viewed by strangers
        if (!$card->user->is_profile_public && $request->user()?->id !== $card->user_id) {
            return $this->error('This card belongs to a private profile', 403);
        }

        return $this->success([
            'card' => $card
        ], 'Knowledge card retrieved successfully');
    }

    /**
     * Toggle like on a knowledge card.
     */
    public function toggleLike(Request $request, string $id): JsonResponse
    {
        $card = KnowledgeCard::findOrFail($id);
        $user = $request->user();

        // Optional: Ensure we can't like cards of private profiles
        if (!$card->user->is_profile_public && $user->id !== $card->user_id) {
            return $this->error('Cannot interact with cards from private profiles', 403);
        }

        // We can manage likes by either toggling a boolean property, 
        // incrementing a counter, or through a pivot table `card_likes`.
        // Let's assume we maintain a pivot table or simple counter.
        // For MVP, we'll increment the `likes_count` locally using a pivot model.
        // Assuming we have a ManyToMany relationship `likedCards` on User or just tracking via `likes_count` directly.

        // We use a pivot DB approach if the relationship exists.
        // If not, we just fallback to increment/decrement counter. We'll use the DB table approach.
        $hasLiked = DB::table('card_likes')
            ->where('user_id', $user->id)
            ->where('knowledge_card_id', $card->id)
            ->exists();

        if ($hasLiked) {
            DB::table('card_likes')
                ->where('user_id', $user->id)
                ->where('knowledge_card_id', $card->id)
                ->delete();
            // Optional: decrement likes_count on KnowledgeCard if exists
            // $card->decrement('likes_count');
            $action = 'unliked';
        } else {
            DB::table('card_likes')->insert([
                'user_id' => $user->id,
                'knowledge_card_id' => $card->id,
                'created_at' => now(),
            ]);
            // $card->increment('likes_count');
            $action = 'liked';
        }

        return $this->success([
            'action' => $action,
            'card_id' => $card->id,
        ], "Card $action successfully");
    }
}
