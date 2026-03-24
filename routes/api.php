<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\ExploreController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\KnowledgeCardController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Middleware\SupabaseAuth;
use Illuminate\Support\Facades\Route;

// Health Check
Route::get('/health', [HealthController::class, 'check']);

// ─── Public Routes ───
Route::prefix('v1/auth')->group(function () {
    // Password Reset (public — still handled by Laravel)
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// ─── Protected Routes (Supabase JWT) ───
Route::middleware(SupabaseAuth::class)->group(function () {

    Route::prefix('v1/auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Email Verification
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
        Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->name('verification.verify');

        // Profile Settings 
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::patch('/settings', [ProfileController::class, 'updateSettings']);
    });

    // ─── Knowledge Profile ───
    Route::prefix('v1/profile')->group(function () {
        Route::get('/me', [ProfileController::class, 'me']);
        Route::get('/me/heatmap', [ProfileController::class, 'heatmap']);
        Route::get('/me/cards', [ProfileController::class, 'cards']);
        Route::post('/me/cards/{id}/pin', [ProfileController::class, 'pinCard']);
        Route::delete('/me/cards/{id}/pin', [ProfileController::class, 'unpinCard']);
        Route::get('/me/achievements', [ProfileController::class, 'achievements']);
        Route::get('/me/xp-history', [ProfileController::class, 'xpHistory']);
        Route::post('/me/share-card/generate', [ProfileController::class, 'generateShareCard']);
        Route::get('/{username}', [ProfileController::class, 'show']);
    });

    // ─── Knowledge Cards (Public Interactions) ───
    Route::prefix('v1/knowledge-cards')->group(function () {
        Route::get('/{id}', [KnowledgeCardController::class, 'show']);
        Route::post('/{id}/like', [KnowledgeCardController::class, 'toggleLike']);
    });

    // ─── Leaderboards ───
    Route::prefix('v1/leaderboards')->group(function () {
        Route::get('/focus', [LeaderboardController::class, 'focus']);
        Route::get('/knowledge', [LeaderboardController::class, 'knowledge']);
        Route::get('/streak', [LeaderboardController::class, 'streak']);
        Route::get('/quiz', [LeaderboardController::class, 'quiz']);
        Route::get('/subject/{subject}', [LeaderboardController::class, 'subject']);
    });

    // ─── Social Discovery ───
    Route::prefix('v1/explore')->group(function () {
        Route::get('/trending', [ExploreController::class, 'trending']);
        Route::get('/rising-stars', [ExploreController::class, 'risingStars']);
        Route::get('/hall-of-sages', [ExploreController::class, 'hallOfSages']);
        Route::get('/by-subject/{subject}', [ExploreController::class, 'bySubject']);
    });

    Route::prefix('v1/feed')->group(function () {
        Route::get('/', [FeedController::class, 'index']);
        Route::post('/{id}/like', [FeedController::class, 'toggleLike']);
    });

    Route::prefix('v1/friends')->group(function () {
        Route::get('/', [FriendController::class, 'index']);
        Route::get('/requests', [FriendController::class, 'requests']);
        Route::post('/request/{username}', [FriendController::class, 'request']);
        Route::post('/accept/{id}', [FriendController::class, 'accept']);
        Route::post('/decline/{id}', [FriendController::class, 'decline']);
        Route::delete('/{id}', [FriendController::class, 'remove']);
    });

    Route::get('v1/users/search', [SearchController::class, 'index']);

    // ─── Content ───
    Route::prefix('v1/content')->group(function () {
        Route::get('/', [ContentController::class, 'index']);
        Route::post('/upload', [ContentController::class, 'upload']);
        Route::post('/url', [ContentController::class, 'url']);
        Route::get('/{id}', [ContentController::class, 'show']);
        Route::delete('/{id}', [ContentController::class, 'destroy']);
    });

    // ─── Learning Sessions ───
    Route::prefix('v1/sessions')->group(function () {
        Route::post('/start', [SessionController::class, 'start']);
        Route::patch('/{id}/progress', [SessionController::class, 'updateProgress']);
        Route::post('/{id}/quiz-attempt', [SessionController::class, 'submitQuizAttempt']);
        Route::post('/{id}/validate-summary', [SessionController::class, 'validateSummary']);
        Route::post('/{id}/complete', [SessionController::class, 'complete']);
    });
});
