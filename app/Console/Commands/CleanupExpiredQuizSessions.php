<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\QuizSession;
use App\Models\AssistantConversationState;
use Illuminate\Support\Facades\Log;

class CleanupExpiredQuizSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assistant:cleanup-sessions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup expired quiz sessions and states';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $limitTime = now()->subHours(24);
            
            // Clean up QuizSession
            $sessionsCount = QuizSession::whereIn('status', ['active', 'paused'])
                ->where('started_at', '<', $limitTime)
                ->update(['status' => 'expired']);

            // Clean up AssistantConversationState
            // Using last_updated_at as expiration fallback if expires_at is not natively present
            $statesCount = AssistantConversationState::where('last_updated_at', '<', now()->subHours(24))
                ->where('state->phase', '!=', 'completed')
                ->delete();

            Log::info("CleanupExpiredQuizSessions: Processed {$sessionsCount} quiz sessions and {$statesCount} conversation states.");
            $this->info("Successfully cleaned up {$sessionsCount} quiz sessions and {$statesCount} conversation states.");

            return 0;
        } catch (\Exception $e) {
            Log::error("CleanupExpiredQuizSessions Error: " . $e->getMessage());
            $this->error("Failed to cleanup expired sessions.");
            return 1;
        }
    }
}
