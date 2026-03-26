<?php

namespace App\Services;

use App\Models\LearningRelay;
use App\Models\User;
use Illuminate\Support\Str;

class LearningRelayService
{
    public function __construct(
        protected FeedEventService $feedEventService,
    ) {}

    public function generateInviteCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (LearningRelay::where('invite_code', $code)->exists());

        return $code;
    }

    public function splitContentIntoSections(string $text, int $numberOfSections): array
    {
        $paragraphs = preg_split('/\n{2,}/', trim($text));
        $sections = array_fill(0, $numberOfSections, '');

        foreach ($paragraphs as $index => $paragraph) {
            $sectionIndex = $index % $numberOfSections;
            $sections[$sectionIndex] .= ($sections[$sectionIndex] ? "\n\n" : '') . $paragraph;
        }

        return array_values(array_filter($sections, fn ($s) => trim($s) !== ''));
    }

    public function checkAllSummariesComplete(LearningRelay $relay): bool
    {
        return $relay->participants()
            ->wherePivot('section_completed', false)
            ->count() === 0;
    }

    public function mergeSummaries(LearningRelay $relay): string
    {
        $summaries = $relay->participants()
            ->orderByPivot('section_index', 'asc')
            ->get()
            ->pluck('pivot.section_summary')
            ->filter()
            ->toArray();

        return implode("\n\n---\n\n", $summaries);
    }

    public function completeRelay(LearningRelay $relay): void
    {
        $combinedSummary = $this->mergeSummaries($relay);

        $relay->update([
            'combined_summary' => $combinedSummary,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Award XP +40% to all participants
        $baseXp = 100;
        $bonusXp = (int) ($baseXp * 1.4);
        $baseCoins = 15;

        foreach ($relay->participants as $participant) {
            $relay->participants()->updateExistingPivot($participant->id, [
                'xp_earned' => $bonusXp,
                'coins_earned' => $baseCoins,
            ]);

            $participant->increment('xp', $bonusXp);
            $participant->wallet?->increment('coins', $baseCoins);
        }

        $this->feedEventService->logEvent(
            User::find($relay->creator_id),
            'relay_complete',
            'Learning Relay completed!',
            ['relay_id' => $relay->id]
        );
    }
}
