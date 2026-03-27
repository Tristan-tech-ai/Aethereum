<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentPurchase;
use App\Models\CoinTransaction;
use App\Models\LearningContent;
use App\Models\UserWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MarketplaceController extends Controller
{
    /**
     * GET /api/v1/marketplace
     *
     * List all public courses with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = LearningContent::with('user:id,name,username,avatar_url')
            ->where('is_public', true)
            ->where('status', 'ready');

        // Filters
        if ($request->filled('subject')) {
            $query->where('subject_category', $request->input('subject'));
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        if ($request->filled('type')) {
            switch ($request->input('type')) {
                case 'free':
                    $query->where('is_pro', false)->where('coin_price', 0);
                    break;
                case 'paid':
                    $query->where('is_pro', false)->where('coin_price', '>', 0);
                    break;
                case 'pro':
                    $query->where('is_pro', true);
                    break;
            }
        }

        if ($request->filled('content_type')) {
            $query->where('content_type', $request->input('content_type'));
        }

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('subject_category', 'ilike', "%{$search}%");
            });
        }

        // Sorting
        switch ($request->input('sort', 'recent')) {
            case 'popular':
                $query->withCount('purchases')->orderByDesc('purchases_count');
                break;
            case 'price_asc':
                $query->orderBy('coin_price');
                break;
            case 'price_desc':
                $query->orderByDesc('coin_price');
                break;
            default:
                $query->orderByDesc('created_at');
        }

        // Pro courses always at top if no specific type filter
        if (!$request->filled('type')) {
            $query->orderByDesc('is_pro');
        }

        $perPage = min((int) $request->input('per_page', 18), 50);
        $courses = $query->paginate($perPage);

        // Get user's purchased content IDs for ownership check
        $purchasedIds = ContentPurchase::where('user_id', $user->id)
            ->pluck('content_id')
            ->toArray();

        $items = $courses->getCollection()->map(function ($c) use ($user, $purchasedIds) {
            $isOwner = $c->user_id === $user->id;
            $isPurchased = in_array($c->id, $purchasedIds);

            return [
                'id' => $c->id,
                'title' => $c->title,
                'content_type' => $c->content_type,
                'subject_category' => $c->subject_category,
                'subject_icon' => $c->subject_icon,
                'subject_color' => $c->subject_color,
                'difficulty' => $c->difficulty,
                'estimated_duration' => $c->estimated_duration,
                'total_pages' => $c->total_pages,
                'thumbnail_url' => $c->thumbnail_url,
                'language' => $c->language,
                'coin_price' => $c->coin_price,
                'is_pro' => $c->is_pro,
                'is_owner' => $isOwner,
                'is_purchased' => $isPurchased || $isOwner,
                'can_access' => $isOwner || $isPurchased || $c->coin_price === 0,
                'author' => $c->user ? [
                    'id' => $c->user->id,
                    'name' => $c->user->name,
                    'username' => $c->user->username,
                    'avatar_url' => $c->user->avatar_url,
                ] : null,
                'created_at' => $c->created_at,
                'quiz_count' => $c->quiz_count,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    /**
     * GET /api/v1/marketplace/{id}
     *
     * Get single public course detail.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $course = LearningContent::with('user:id,name,username,avatar_url')
            ->where('is_public', true)
            ->where('status', 'ready')
            ->findOrFail($id);

        $isOwner = $course->user_id === $user->id;
        $isPurchased = ContentPurchase::where('user_id', $user->id)
            ->where('content_id', $id)
            ->exists();

        return response()->json([
            'data' => array_merge($course->toArray(), [
                'is_owner' => $isOwner,
                'is_purchased' => $isPurchased || $isOwner,
                'can_access' => $isOwner || $isPurchased || $course->coin_price === 0,
                'author' => $course->user ? [
                    'id' => $course->user->id,
                    'name' => $course->user->name,
                    'username' => $course->user->username,
                    'avatar_url' => $course->user->avatar_url,
                ] : null,
            ]),
        ]);
    }

    /**
     * POST /api/v1/marketplace/{id}/purchase
     *
     * Purchase a course with Nexera coins.
     */
    public function purchase(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $course = LearningContent::where('is_public', true)
            ->where('status', 'ready')
            ->findOrFail($id);

        // Cannot buy your own course
        if ($course->user_id === $user->id) {
            return response()->json(['message' => 'You already own this course.'], 422);
        }

        // Free course — just mark as accessed (no purchase record needed, return access)
        if ($course->coin_price === 0) {
            return response()->json([
                'message' => 'This course is free.',
                'can_access' => true,
            ]);
        }

        // Already purchased
        if (ContentPurchase::where('user_id', $user->id)->where('content_id', $id)->exists()) {
            return response()->json(['message' => 'You already own this course.', 'can_access' => true]);
        }

        // Get wallet
        $wallet = UserWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['current_balance' => 0, 'total_earned' => 0, 'total_spent' => 0, 'daily_earned' => 0, 'daily_cap' => 500]
        );

        if ($wallet->current_balance < $course->coin_price) {
            return response()->json([
                'message' => 'Insufficient coins.',
                'required' => $course->coin_price,
                'balance' => $wallet->current_balance,
            ], 422);
        }

        DB::transaction(function () use ($wallet, $course, $user) {
            // Deduct coins
            $newBalance = $wallet->current_balance - $course->coin_price;
            $wallet->current_balance = $newBalance;
            $wallet->total_spent += $course->coin_price;
            $wallet->save();

            // Log transaction
            CoinTransaction::create([
                'id' => (string) Str::uuid(),
                'wallet_id' => $wallet->id,
                'user_id' => $user->id,
                'type' => 'spend',
                'amount' => $course->coin_price,
                'balance_after' => $newBalance,
                'source' => 'course_purchase',
                'description' => "Purchased course: {$course->title}",
                'reference_id' => $course->id,
                'reference_type' => 'LearningContent',
            ]);

            // Record purchase
            ContentPurchase::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'content_id' => $course->id,
                'coins_paid' => $course->coin_price,
                'purchased_at' => now(),
            ]);

            // Credit seller (if content has an owner who is not a pro/system course)
            if (!$course->is_pro && $course->user_id) {
                $sellerWallet = UserWallet::firstOrCreate(
                    ['user_id' => $course->user_id],
                    ['current_balance' => 0, 'total_earned' => 0, 'total_spent' => 0, 'daily_earned' => 0, 'daily_cap' => 500]
                );
                $sellerNewBalance = $sellerWallet->current_balance + $course->coin_price;
                $sellerWallet->current_balance = $sellerNewBalance;
                $sellerWallet->total_earned += $course->coin_price;
                $sellerWallet->save();

                CoinTransaction::create([
                    'id' => (string) Str::uuid(),
                    'wallet_id' => $sellerWallet->id,
                    'user_id' => $course->user_id,
                    'type' => 'earn',
                    'amount' => $course->coin_price,
                    'balance_after' => $sellerNewBalance,
                    'source' => 'course_sale',
                    'description' => "Course sale: {$course->title}",
                    'reference_id' => $course->id,
                    'reference_type' => 'LearningContent',
                ]);
            }
        });

        $wallet->refresh();

        return response()->json([
            'message' => 'Course purchased successfully!',
            'coins_spent' => $course->coin_price,
            'new_balance' => $wallet->current_balance,
            'can_access' => true,
        ]);
    }

    /**
     * GET /api/v1/marketplace/wallet-balance
     *
     * Return authenticated user's current coin balance.
     */
    public function walletBalance(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = UserWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['current_balance' => 0, 'total_earned' => 0, 'total_spent' => 0, 'daily_earned' => 0, 'daily_cap' => 500]
        );

        return response()->json(['balance' => $wallet->current_balance]);
    }

    /**
     * GET /api/v1/marketplace/purchased
     *
     * List courses the authenticated user has purchased.
     */
    public function purchased(Request $request): JsonResponse
    {
        $user = $request->user();

        $purchases = ContentPurchase::with(['content.user:id,name,username,avatar_url'])
            ->where('user_id', $user->id)
            ->orderByDesc('purchased_at')
            ->get();

        $data = $purchases->map(function ($p) {
            if (!$p->content) return null;
            $c = $p->content;
            return [
                'id' => $c->id,
                'title' => $c->title,
                'content_type' => $c->content_type,
                'subject_category' => $c->subject_category,
                'subject_icon' => $c->subject_icon,
                'subject_color' => $c->subject_color,
                'difficulty' => $c->difficulty,
                'estimated_duration' => $c->estimated_duration,
                'thumbnail_url' => $c->thumbnail_url,
                'coin_price' => $c->coin_price,
                'is_pro' => $c->is_pro,
                'is_purchased' => true,
                'can_access' => true,
                'coins_paid' => $p->coins_paid,
                'purchased_at' => $p->purchased_at,
                'author' => $c->user ? [
                    'name' => $c->user->name,
                    'username' => $c->user->username,
                    'avatar_url' => $c->user->avatar_url,
                ] : null,
            ];
        })->filter()->values();

        return response()->json(['data' => $data]);
    }
}
