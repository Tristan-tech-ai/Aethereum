<?php

namespace App\Services;

use App\Models\LearningSession;

class FocusTrackerService
{
    /**
     * Default integrity penalty per tab switch (percentage points).
     */
    private const DEFAULT_PENALTY_PER_SWITCH = 15.0;

    /**
     * Minimum focus integrity (can't go below 0).
     */
    private const MIN_INTEGRITY = 0.0;

    /**
     * Maximum focus integrity.
     */
    private const MAX_INTEGRITY = 100.0;

    /**
     * Calculate focus_integrity from an array of distraction events.
     *
     * Each event looks like:
     *   { "type": "tab_switch"|"window_blur"|"restore", "timestamp": "...", "duration_ms": ... }
     *
     * @param  array  $events     Distraction events from frontend
     * @param  float  $penalty    Penalty per distraction event (percentage points)
     * @return array  ['focus_integrity' => float, 'tab_switches' => int, 'distraction_count' => int]
     */
    public function calculateIntegrity(array $events, float $penalty = self::DEFAULT_PENALTY_PER_SWITCH): array
    {
        $tabSwitches       = 0;
        $distractionCount  = 0;

        foreach ($events as $event) {
            $type = $event['type'] ?? '';

            if (in_array($type, ['tab_switch', 'window_blur'])) {
                $tabSwitches++;
                $distractionCount++;
            }
        }

        $integrity = max(
            self::MIN_INTEGRITY,
            self::MAX_INTEGRITY - ($distractionCount * $penalty)
        );

        return [
            'focus_integrity'    => round($integrity, 2),
            'tab_switches'       => $tabSwitches,
            'distraction_count'  => $distractionCount,
        ];
    }

    /**
     * Update the focus metrics on a LearningSession from incoming focus data.
     *
     * @param  LearningSession  $session
     * @param  array            $data  ['events' => [...], 'active_time' => int (seconds)]
     * @return LearningSession  The updated session
     */
    public function updateFocusMetrics(LearningSession $session, array $data): LearningSession
    {
        $events    = $data['events'] ?? [];
        $activeTime = (int) ($data['active_time'] ?? 0);

        // Calculate from new events
        $metrics = $this->calculateIntegrity($events);

        // Accumulate tab_switches and distraction_count
        $totalSwitches     = $session->tab_switches + $metrics['tab_switches'];
        $totalDistractions = $session->distraction_count + $metrics['distraction_count'];

        // Recalculate integrity based on total distractions
        $penalty   = self::DEFAULT_PENALTY_PER_SWITCH;
        $integrity = max(
            self::MIN_INTEGRITY,
            self::MAX_INTEGRITY - ($totalDistractions * $penalty)
        );

        $session->update([
            'focus_integrity'    => round($integrity, 2),
            'tab_switches'       => $totalSwitches,
            'distraction_count'  => $totalDistractions,
            'total_focus_time'   => $session->total_focus_time + $activeTime,
        ]);

        return $session->fresh();
    }
}
