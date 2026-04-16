<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use App\Services\QuizAssistantAdapter;
use App\Services\QuizAssistantAdapterInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(\App\Services\QuizAssistantAdapterInterface::class, \App\Services\QuizAssistantAdapter::class);
        $this->app->singleton(\App\Services\QuizIntentDetectorService::class);
        $this->app->singleton(\App\Services\MaterialRecommendationService::class);
        $this->app->singleton(\App\Services\QuizConfigurationFlowService::class);
        $this->app->singleton(\App\Services\QuizResultAnalyzerService::class);
        $this->app->singleton(\App\Services\QuizFeedbackGeneratorService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(60)->by($request->user()->id)
                : Limit::perMinute(10)->by($request->ip());
        });

        $quizRateLimitResponse = function (Request $request, array $headers) {
            return response()->json([
                'success' => false,
                'error_code' => 'RATE_LIMITED',
                'message' => 'Terlalu banyak permintaan. Coba lagi dalam beberapa saat.',
                'retry_after' => $headers['Retry-After'] ?? 60
            ], 429, $headers);
        };

        RateLimiter::for('quiz_generate', function (Request $request) use ($quizRateLimitResponse) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip())->response($quizRateLimitResponse);
        });

        RateLimiter::for('quiz_submit', function (Request $request) use ($quizRateLimitResponse) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip())->response($quizRateLimitResponse);
        });

        RateLimiter::for('quiz_chat', function (Request $request) use ($quizRateLimitResponse) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip())->response($quizRateLimitResponse);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null
        );
    }
}
