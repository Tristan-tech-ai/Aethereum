<?php

namespace App\Console\Commands;

use App\Models\KnowledgeCard;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CardsDecayIntegrityCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cards:decay-integrity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Decay the mastery/integrity of knowledge cards over time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cards integrity decay process...');

        // In a real app, this logic might be more complex based on spaced repetition factors
        // For demonstration, we simply reduce mastery_percentage by 1% for cards untouched $> 7$ days
        $thresholdDate = now()->subDays(7);

        $updatedCount = KnowledgeCard::where('updated_at', '<', $thresholdDate)
            ->where('mastery_percentage', '>', 50) // Don't decay below 50%
            ->decrement('mastery_percentage', 1);

        Log::info("Cards integrity decayed: $updatedCount cards affected.");
        $this->info("Successfully decayed $updatedCount cards.");
    }
}
