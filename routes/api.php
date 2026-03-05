<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProfileController;
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

        // Profile
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::patch('/settings', [ProfileController::class, 'updateSettings']);
    });

    // ─── Content ───
    Route::prefix('v1/content')->group(function () {
        Route::get('/', [ContentController::class, 'index']);
        Route::post('/upload', [ContentController::class, 'upload']);
        Route::post('/url', [ContentController::class, 'url']);
        Route::get('/{id}', [ContentController::class, 'show']);
        Route::delete('/{id}', [ContentController::class, 'destroy']);
    });
});
