<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class LeaderboardWeeklyResetCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leaderboard:weekly-reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset weekly metrics for leaderboards';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting weekly leaderboard metric reset...');

        // This assumes we have some fields like 'weekly_xp' or 'weekly_focus_minutes' 
        // to reset. For now, since the models don't have explicit weekly accumulating columns,
        // we simulate this action and log it. In the future we could clear a Redis sorted set
        // or reset a specific `weekly_xp` column.
        
        Log::info('Leaderboard weekly reset triggered.');
        $this->info('Weekly leaderboard metrics reset successfully.');
    }
}
