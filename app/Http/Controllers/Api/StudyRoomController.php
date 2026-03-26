<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudyRoom;
use App\Services\StudyRoomService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyRoomController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected StudyRoomService $roomService,
    ) {}

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
            'max_capacity' => 'integer|min:2|max:20',
            'music_preset' => 'nullable|in:lofi,classical,nature,silence',
        ]);

        $user = $request->user();

        $room = StudyRoom::create([
            'creator_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'room_code' => $this->roomService->generateRoomCode(),
            'is_public' => $request->input('is_public', true),
            'max_capacity' => $request->input('max_capacity', 20),
            'music_preset' => $request->input('music_preset', 'lofi'),
            'status' => 'active',
        ]);

        // Creator auto-joins
        $this->roomService->addMember($room, $user);

        return $this->success([
            'room' => $room->load('members'),
        ], 'Study room created', 201);
    }

    public function publicRooms(Request $request): JsonResponse
    {
        $rooms = StudyRoom::where('is_public', true)
            ->where('status', 'active')
            ->withCount(['members as online_members_count' => fn ($q) => $q->where('study_room_members.is_online', true)])
            ->with('creator:id,name,username,avatar_url')
            ->latest()
            ->paginate(12);

        return $this->success(['rooms' => $rooms]);
    }

    public function join(Request $request): JsonResponse
    {
        $request->validate(['room_code' => 'required|string']);

        $user = $request->user();
        $room = StudyRoom::where('room_code', $request->room_code)
            ->where('status', 'active')
            ->firstOrFail();

        $onlineCount = $room->members()->where('study_room_members.is_online', true)->count();
        if ($onlineCount >= $room->max_capacity) {
            return $this->error('Room is full', 400);
        }

        $this->roomService->addMember($room, $user, $request->input('material'));

        return $this->success([
            'room' => $room->load('members'),
        ], 'Joined room');
    }

    public function updatePresence(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'material' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $room = StudyRoom::where('id', $id)->where('status', 'active')->firstOrFail();

        $this->roomService->updatePresence($room, $user, $request->material);

        return $this->success(null, 'Presence updated');
    }

    public function react(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        $user = $request->user();
        $room = StudyRoom::where('id', $id)->where('status', 'active')->firstOrFail();

        $this->roomService->sendReaction($room, $user, $request->emoji);

        return $this->success(null, 'Reaction sent');
    }

    public function leave(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $room = StudyRoom::findOrFail($id);

        $this->roomService->removeMember($room, $user);

        return $this->success(null, 'Left room');
    }

    public function close(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $room = StudyRoom::where('id', $id)
            ->where('creator_id', $user->id)
            ->firstOrFail();

        $room->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return $this->success(null, 'Room closed');
    }
}
