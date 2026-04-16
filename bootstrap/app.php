<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            //
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'supabase.auth' => \App\Http\Middleware\SupabaseAuth::class,
            'quiz.session.owner' => \App\Http\Middleware\ValidateQuizSessionOwnership::class,
        ]);

        // Force API routes to return JSON (not 302 redirect)
        $middleware->redirectGuestsTo(fn (Request $request) => $request->expectsJson()
            ? null
            : route('login')
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Always return JSON for API requests
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status' => 'Error',
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        $exceptions->render(function (\App\Exceptions\QuizAssistant\QuizGenerationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                \Illuminate\Support\Facades\Log::warning('QuizGenerationException: ' . $e->getMessage(), $e->contextData ?? []);
                return response()->json([
                    'success' => false,
                    'error_code' => 'QUIZ_GENERATION_FAILED',
                    'message' => $e->getMessage(),
                    'data' => ['suggestion' => 'reduce_count']
                ], 422);
            }
        });
        
        $exceptions->render(function (\App\Exceptions\QuizAssistant\InvalidConversationStateException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                \Illuminate\Support\Facades\Log::warning('InvalidConversationStateException: ' . $e->getMessage(), $e->contextData ?? []);
                return response()->json([
                    'success' => false,
                    'error_code' => 'INVALID_STATE',
                    'message' => $e->getMessage(),
                    'data' => [
                        'current_phase' => $e->contextData['current_phase'] ?? 'unknown',
                        'expected_phase' => $e->contextData['expected_phase'] ?? 'unknown'
                    ]
                ], 409);
            }
        });

        $exceptions->render(function (\App\Exceptions\QuizAssistant\MaterialNotFoundException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                \Illuminate\Support\Facades\Log::warning('MaterialNotFoundException: ' . $e->getMessage(), $e->contextData ?? []);
                return response()->json([
                    'success' => false,
                    'error_code' => 'MATERIAL_NOT_FOUND',
                    'message' => $e->getMessage(),
                ], 404);
            }
        });
    })->create();
