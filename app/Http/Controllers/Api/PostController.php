<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Models\PostComment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostController extends Controller
{
    use ApiResponse;

    // ──────────────────────────────────────────────────────────────
    // GET /api/v1/posts   — paginated feed (self + friends)
    // ──────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $user   = $request->user();
        $perPage = max(5, min(30, (int) $request->input('per_page', 15)));

        $audienceIds = $this->audienceUserIds($user->id);

        $posts = CommunityPost::with('user:id,name,username,avatar_url,level')
            ->whereIn('user_id', $audienceIds)
            ->latest()
            ->paginate($perPage);

        $postIds  = $posts->getCollection()->pluck('id')->all();
        $likedIds = DB::table('post_likes')
            ->where('user_id', $user->id)
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->flip();

        $posts->getCollection()->transform(function (CommunityPost $post) use ($likedIds) {
            $post->liked_by_me = $likedIds->has($post->id);
            return $post;
        });

        return $this->success(['posts' => $posts], 'Posts retrieved successfully');
    }

    // ──────────────────────────────────────────────────────────────
    // POST /api/v1/posts  — create a new post
    // ──────────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'post_type' => ['required', 'in:text,image,raid_invite,duel_invite'],
            'body'      => ['nullable', 'string', 'max:2000'],
            'image_url' => ['nullable', 'string', 'max:2000'],
            'ref_id'    => ['nullable', 'uuid'],
            'ref_meta'  => ['nullable', 'array'],
        ]);

        $type = $request->input('post_type');

        // text post must have body
        if ($type === 'text' && empty(trim($request->input('body', '')))) {
            return $this->error('Post body is required for text posts', 422);
        }

        // image post must have image_url
        if ($type === 'image' && empty($request->input('image_url'))) {
            return $this->error('Image URL is required for image posts', 422);
        }

        // raid/duel invite must have ref_id
        if (in_array($type, ['raid_invite', 'duel_invite']) && empty($request->input('ref_id'))) {
            return $this->error('ref_id is required for invite posts', 422);
        }

        $post = CommunityPost::create([
            'user_id'   => $request->user()->id,
            'post_type' => $type,
            'body'      => $request->input('body'),
            'image_url' => $request->input('image_url'),
            'ref_id'    => $request->input('ref_id'),
            'ref_meta'  => $request->input('ref_meta', []),
        ]);

        $post->load('user:id,name,username,avatar_url,level');
        $post->liked_by_me = false;

        return $this->success(['post' => $post], 'Post created successfully', 201);
    }

    // ──────────────────────────────────────────────────────────────
    // DELETE /api/v1/posts/{id}  — delete own post
    // ──────────────────────────────────────────────────────────────
    public function destroy(Request $request, string $id): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        // Clean up stored image if local
        if ($post->image_url && str_starts_with($post->image_url, 'post-images/')) {
            Storage::disk('public')->delete($post->image_url);
        }

        $post->delete();

        return $this->success(null, 'Post deleted successfully');
    }

    // ──────────────────────────────────────────────────────────────
    // POST /api/v1/posts/{id}/like  — toggle like
    // ──────────────────────────────────────────────────────────────
    public function toggleLike(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $post = CommunityPost::findOrFail($id);

        $audienceIds = $this->audienceUserIds($user->id);
        if (!in_array($post->user_id, $audienceIds, true)) {
            return $this->error('You cannot interact with this post', 403);
        }

        $exists = DB::table('post_likes')
            ->where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            DB::table('post_likes')
                ->where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->delete();
            $post->decrement('likes_count');
            $action = 'unliked';
        } else {
            DB::table('post_likes')->insert([
                'post_id' => $post->id,
                'user_id' => $user->id,
            ]);
            $post->increment('likes_count');
            $action = 'liked';
        }

        return $this->success([
            'action'      => $action,
            'likes_count' => $post->fresh()->likes_count,
        ], "Post $action successfully");
    }

    // ──────────────────────────────────────────────────────────────
    // GET /api/v1/posts/{id}/comments  — list comments
    // ──────────────────────────────────────────────────────────────
    public function comments(Request $request, string $id): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);

        $comments = PostComment::with('user:id,name,username,avatar_url')
            ->where('post_id', $post->id)
            ->oldest()
            ->get();

        return $this->success(['comments' => $comments], 'Comments retrieved successfully');
    }

    // ──────────────────────────────────────────────────────────────
    // POST /api/v1/posts/{id}/comments  — add a comment
    // ──────────────────────────────────────────────────────────────
    public function addComment(Request $request, string $id): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);

        // Allow commenting on any visible post (self + friends)
        $audienceIds = $this->audienceUserIds($request->user()->id);
        if (!in_array($post->user_id, $audienceIds, true)) {
            return $this->error('You cannot comment on this post', 403);
        }

        $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $comment = PostComment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'body'    => $request->input('body'),
        ]);

        $post->increment('comments_count');

        $comment->load('user:id,name,username,avatar_url');

        return $this->success(['comment' => $comment], 'Comment added successfully', 201);
    }

    // ──────────────────────────────────────────────────────────────
    // DELETE /api/v1/posts/{postId}/comments/{commentId}
    // ──────────────────────────────────────────────────────────────
    public function deleteComment(Request $request, string $postId, string $commentId): JsonResponse
    {
        $comment = PostComment::where('post_id', $postId)->findOrFail($commentId);

        $userId = $request->user()->id;
        $post   = CommunityPost::findOrFail($postId);

        // Comment owner OR post owner can delete
        if ($comment->user_id !== $userId && $post->user_id !== $userId) {
            return $this->error('Unauthorized', 403);
        }

        $comment->delete();
        $post->decrement('comments_count');

        return $this->success(null, 'Comment deleted successfully');
    }

    // ──────────────────────────────────────────────────────────────
    // POST /api/v1/posts/upload-image  — upload image for post
    // ──────────────────────────────────────────────────────────────
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'], // 5 MB
        ]);

        $file     = $request->file('image');
        $filename = 'post-images/' . $request->user()->id . '/' . Str::uuid() . '.' . $file->getClientOriginalExtension();

        Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

        return $this->success([
            'image_url'  => $filename,
            'full_url'   => asset('storage/' . $filename),
        ], 'Image uploaded successfully', 201);
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────
    private function audienceUserIds(string $userId): array
    {
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_id', $userId)
                    ->orWhere('addressee_id', $userId);
            })
            ->get()
            ->flatMap(fn ($f) => [$f->requester_id, $f->addressee_id])
            ->unique()
            ->reject(fn ($id) => $id === $userId)
            ->values()
            ->all();

        return array_merge([$userId], $friendIds);
    }
}
