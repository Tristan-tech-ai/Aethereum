<?php

namespace App\Services;

use App\Events\StudyRoomPomodoro;
use App\Events\StudyRoomPresenceUpdate;
use App\Events\StudyRoomReaction;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class StudyRoomService
{
    public function generateRoomCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (StudyRoom::where('room_code', $code)->exists());

        return $code;
    }

    public function addMember(StudyRoom $room, User $user, ?string $material = null): void
    {
        $room->members()->syncWithoutDetaching([
            $user->id => [
                'is_online' => true,
                'current_material' => $material,
                'joined_at' => now(),
                'last_active_at' => now(),
            ],
        ]);

        broadcast(new StudyRoomPresenceUpdate($room->id, $user->id, 'joined', $material))->toOthers();
    }

    public function removeMember(StudyRoom $room, User $user): void
    {
        $room->members()->updateExistingPivot($user->id, [
            'is_online' => false,
        ]);

        broadcast(new StudyRoomPresenceUpdate($room->id, $user->id, 'left', null))->toOthers();
    }

    public function updatePresence(StudyRoom $room, User $user, ?string $material): void
    {
        $room->members()->updateExistingPivot($user->id, [
            'current_material' => $material,
            'last_active_at' => now(),
            'is_online' => true,
        ]);

        broadcast(new StudyRoomPresenceUpdate($room->id, $user->id, 'updated', $material))->toOthers();
    }

    public function sendReaction(StudyRoom $room, User $user, string $emoji): void
    {
        broadcast(new StudyRoomReaction($room->id, $user->id, $user->name, $emoji))->toOthers();
    }

    public function togglePomodoro(StudyRoom $room, string $phase): void
    {
        $room->update([
            'current_pomodoro_phase' => $phase,
            'pomodoro_started_at' => now(),
        ]);

        $duration = $phase === 'study' ? 1500 : 300; // 25min or 5min

        broadcast(new StudyRoomPomodoro($room->id, $phase, $duration, now()->toIso8601String()))->toOthers();
    }

    public function cleanupInactiveMembers(): int
    {
        $threshold = now()->subMinutes(10);
        $count = 0;

        $rooms = StudyRoom::where('status', 'active')->get();

        foreach ($rooms as $room) {
            $inactive = $room->members()
                ->wherePivot('is_online', true)
                ->wherePivot('last_active_at', '<', $threshold)
                ->get();

            foreach ($inactive as $member) {
                $room->members()->updateExistingPivot($member->id, ['is_online' => false]);
                broadcast(new StudyRoomPresenceUpdate($room->id, $member->id, 'inactive', null))->toOthers();
                $count++;
            }
        }

        return $count;
    }
}
