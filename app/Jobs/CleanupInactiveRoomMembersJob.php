<?php

namespace App\Jobs;

use App\Events\StudyRoomPresenceUpdate;
use App\Models\StudyRoom;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CleanupInactiveRoomMembersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $activeRooms = StudyRoom::where('status', 'active')->get();

        foreach ($activeRooms as $room) {
            $inactiveMembers = $room->members()
                ->wherePivot('is_online', true)
                ->wherePivot('last_active_at', '<', now()->subMinutes(10))
                ->get();

            foreach ($inactiveMembers as $member) {
                $room->members()->updateExistingPivot($member->id, [
                    'is_online' => false,
                ]);

                broadcast(new StudyRoomPresenceUpdate(
                    $room->id,
                    $member->id,
                    'inactive',
                    null,
                ))->toOthers();
            }
        }
    }
}
