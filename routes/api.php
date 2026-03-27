<?php

use App\Http\Controllers\Api\AssistantController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExploreController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\FocusDuelController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\KnowledgeCardController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\LeagueController;
use App\Http\Controllers\Api\LearningRelayController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\QuizArenaController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\MyTaskController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\StudyRaidController;
use App\Http\Controllers\Api\StudyRoomController;
use App\Http\Controllers\Api\WeeklyChallengeController;
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

    // ─── Dashboard (Aggregated) ───
    Route::get('v1/dashboard', [DashboardController::class, 'index']);
    Route::get('v1/reports/learning', [ReportController::class, 'learning']);

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
        Route::get('/{username}/heatmap', [ProfileController::class, 'publicHeatmap']);
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

    // ─── League ───
    Route::get('v1/league', [LeagueController::class, 'show']);

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

    // ─── Community Posts (threads) ───
    Route::prefix('v1/posts')->group(function () {
        Route::get('/', [PostController::class, 'index']);
        Route::post('/', [PostController::class, 'store']);
        Route::delete('/{id}', [PostController::class, 'destroy']);
        Route::post('/{id}/like', [PostController::class, 'toggleLike']);
        Route::get('/{id}/comments', [PostController::class, 'comments']);
        Route::post('/{id}/comments', [PostController::class, 'addComment']);
        Route::delete('/{postId}/comments/{commentId}', [PostController::class, 'deleteComment']);
        Route::post('/upload-image', [PostController::class, 'uploadImage']);
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
        Route::patch('/{id}/visibility', [ContentController::class, 'updateVisibility']);
    });

    // ─── Course Marketplace ───
    Route::prefix('v1/marketplace')->group(function () {
        Route::get('/', [MarketplaceController::class, 'index']);
        Route::get('/purchased', [MarketplaceController::class, 'purchased']);
        Route::get('/wallet-balance', [MarketplaceController::class, 'walletBalance']);
        Route::get('/{id}', [MarketplaceController::class, 'show']);
        Route::post('/{id}/purchase', [MarketplaceController::class, 'purchase']);
        Route::post('/{id}/add-to-my-courses', [MarketplaceController::class, 'addToMyCourses']);
    });

    // ─── Learning Sessions ───
    Route::prefix('v1/sessions')->group(function () {
        Route::get('/active', [SessionController::class, 'myActiveSessions']);
        Route::get('/completed', [SessionController::class, 'completedSessions']);
        Route::post('/start', [SessionController::class, 'start']);
        Route::patch('/{id}/progress', [SessionController::class, 'updateProgress']);
        Route::get('/{id}/quiz', [SessionController::class, 'getQuiz']);
        Route::post('/{id}/quiz-attempt', [SessionController::class, 'submitQuizAttempt']);
        Route::post('/{id}/validate-summary', [SessionController::class, 'validateSummary']);
        Route::post('/{id}/complete', [SessionController::class, 'complete']);
    });

    // ─── My Tasks (Aggregation) ───
    Route::prefix('v1/my-tasks')->group(function () {
        Route::get('/summary', [MyTaskController::class, 'summary']);
    });

    // ─── Study Raids ───
    Route::prefix('v1/raids')->group(function () {
        Route::get('/my', [StudyRaidController::class, 'myRaids']);
        Route::post('/', [StudyRaidController::class, 'create']);
        Route::post('/join', [StudyRaidController::class, 'join']);
        Route::get('/{id}', [StudyRaidController::class, 'show']);
        Route::post('/{id}/chat', [StudyRaidController::class, 'chat']);
        Route::post('/{id}/start', [StudyRaidController::class, 'start']);
        Route::post('/{id}/progress', [StudyRaidController::class, 'updateProgress']);
        Route::post('/{id}/quiz-complete', [StudyRaidController::class, 'quizComplete']);
        Route::post('/{id}/complete', [StudyRaidController::class, 'complete']);
        Route::get('/{id}/results', [StudyRaidController::class, 'results']);
    });

    // ─── Focus Duels ───
    Route::prefix('v1/duels')->group(function () {
        Route::get('/my', [FocusDuelController::class, 'myDuels']);
        Route::post('/challenge', [FocusDuelController::class, 'challenge']);
        Route::post('/{id}/accept', [FocusDuelController::class, 'accept']);
        Route::post('/{id}/decline', [FocusDuelController::class, 'decline']);
        Route::post('/{id}/start', [FocusDuelController::class, 'start']);
        Route::post('/{id}/focus-event', [FocusDuelController::class, 'focusEvent']);
        Route::post('/{id}/complete', [FocusDuelController::class, 'complete']);
    });

    // ─── Quiz Arena ───
    Route::prefix('v1/arena')->group(function () {
        Route::get('/my', [QuizArenaController::class, 'my']);
        Route::post('/', [QuizArenaController::class, 'create']);
        Route::post('/join', [QuizArenaController::class, 'join']);
        Route::post('/{id}/start', [QuizArenaController::class, 'start']);
        Route::post('/{id}/answer', [QuizArenaController::class, 'answer']);
        Route::get('/{id}/results', [QuizArenaController::class, 'results']);
    });

    // ─── Learning Relay ───
    Route::prefix('v1/relay')->group(function () {
        Route::get('/my', [LearningRelayController::class, 'my']);
        Route::post('/', [LearningRelayController::class, 'create']);
        Route::post('/join', [LearningRelayController::class, 'join']);
        Route::post('/{id}/start', [LearningRelayController::class, 'start']);
        Route::post('/{id}/summary', [LearningRelayController::class, 'submitSummary']);
        Route::post('/{id}/quiz', [LearningRelayController::class, 'submitQuiz']);
        Route::get('/{id}/results', [LearningRelayController::class, 'results']);
    });

    // ─── Study Rooms ───
    Route::prefix('v1/rooms')->group(function () {
        Route::get('/public', [StudyRoomController::class, 'publicRooms']);
        Route::get('/{id}', [StudyRoomController::class, 'show']);
        Route::post('/', [StudyRoomController::class, 'create']);
        Route::post('/join', [StudyRoomController::class, 'join']);
        Route::post('/{id}/presence', [StudyRoomController::class, 'updatePresence']);
        Route::post('/{id}/react', [StudyRoomController::class, 'react']);
        Route::post('/{id}/pomodoro', [StudyRoomController::class, 'togglePomodoro']);
        Route::post('/{id}/leave', [StudyRoomController::class, 'leave']);
        Route::post('/{id}/close', [StudyRoomController::class, 'close']);
    });

    // ─── Weekly Challenges ───
    Route::prefix('v1/challenges')->group(function () {
        Route::get('/current', [WeeklyChallengeController::class, 'current']);
        Route::get('/history', [WeeklyChallengeController::class, 'history']);
        Route::get('/{id}/progress', [WeeklyChallengeController::class, 'progress']);
    });

    // ─── Nexera Assistant ───
    Route::prefix('v1/assistant')->group(function () {
        // Conversations
        Route::get('/conversations', [AssistantController::class, 'conversations']);
        Route::get('/conversations/{id}', [AssistantController::class, 'showConversation']);
        Route::delete('/conversations/{id}', [AssistantController::class, 'deleteConversation']);

        // Chat
        Route::post('/chat', [AssistantController::class, 'chat']);

        // Study Plan
        Route::post('/study-plan/generate', [AssistantController::class, 'generateStudyPlan']);

        // Reflection
        Route::post('/reflection', [AssistantController::class, 'reflection']);

        // Preferences
        Route::get('/preferences', [AssistantController::class, 'getPreferences']);
        Route::patch('/preferences', [AssistantController::class, 'updatePreferences']);
    });
});
