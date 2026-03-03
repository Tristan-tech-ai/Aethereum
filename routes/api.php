<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

// Health Check
Route::get('/health', [HealthController::class, 'check']);

// ─── Auth Routes (Public) ───
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Google OAuth
    Route::get('/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('/google/callback', [AuthController::class, 'googleCallback']);

    // Password Reset (public)
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// ─── Protected Routes ───
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('v1/auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        // Email Verification
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
        Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->name('verification.verify');

        // Profile
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::patch('/settings', [ProfileController::class, 'updateSettings']);
    });
});
