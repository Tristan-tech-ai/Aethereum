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

        $room->refresh();

        return $this->success([
            'room' => $this->serializeRoom($room, $user->id, false),
        ], 'Study room created', 201);
    }

    public function publicRooms(Request $request): JsonResponse
    {
        $user = $request->user();

        $rooms = StudyRoom::where('is_public', true)
            ->where('status', 'active')
            ->with([
                'creator:id,name,username,avatar_url',
                'members' => function ($q) {
                    $q->select('users.id', 'name', 'username', 'avatar_url')
                        ->orderByDesc('study_room_members.is_online')
                        ->orderByDesc('study_room_members.last_active_at');
                },
            ])
            ->latest()
            ->paginate(12);

        $rooms->getCollection()->transform(function ($room) use ($user) {
            return $this->serializeRoom($room, $user->id, true);
        });

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

        $room->refresh();

        return $this->success([
            'room' => $this->serializeRoom($room, $user->id, false),
        ], 'Joined room');
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $room = StudyRoom::with([
            'creator:id,name,username,avatar_url',
            'members' => function ($q) {
                $q->select('users.id', 'name', 'username', 'avatar_url')
                    ->orderByDesc('study_room_members.is_online')
                    ->orderByDesc('study_room_members.last_active_at');
            },
        ])->findOrFail($id);

        if (!$room->members()->where('user_id', $user->id)->exists()) {
            return $this->error('You are not a member of this room', 403);
        }

        return $this->success([
            'room' => $this->serializeRoom($room, $user->id, false),
        ], 'Room fetched');
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

    public function togglePomodoro(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'phase' => 'required|in:study,break',
        ]);

        $user = $request->user();
        $room = StudyRoom::where('id', $id)->where('status', 'active')->firstOrFail();

        if ($room->creator_id !== $user->id) {
            return $this->error('Only host can change pomodoro phase', 403);
        }

        $this->roomService->togglePomodoro($room, $request->input('phase'));
        $room->refresh();

        return $this->success([
            'phase' => $room->current_pomodoro_phase,
            'started_at' => optional($room->pomodoro_started_at)?->toISOString(),
            'duration' => $room->current_pomodoro_phase === 'study' ? 1500 : 300,
        ], 'Pomodoro phase updated');
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

    private function serializeRoom(StudyRoom $room, string $viewerId, bool $compact = false): array
    {
        $room->loadMissing([
            'creator:id,name,username,avatar_url',
            'members' => function ($q) {
                $q->select('users.id', 'name', 'username', 'avatar_url')
                    ->orderByDesc('study_room_members.is_online')
                    ->orderByDesc('study_room_members.last_active_at');
            },
        ]);

        $members = $room->members->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'username' => $member->username,
                'avatar_url' => $member->avatar_url,
                'is_online' => (bool) ($member->pivot->is_online ?? false),
                'current_material' => $member->pivot->current_material,
                'joined_at' => optional($member->pivot->joined_at)?->toISOString(),
                'last_active_at' => optional($member->pivot->last_active_at)?->toISOString(),
                'xp_earned' => (int) ($member->pivot->xp_earned ?? 0),
            ];
        })->values();

        $onlineMembers = $members->where('is_online', true)->values();
        $viewerMember = $members->firstWhere('id', $viewerId);

        $base = [
            'id' => $room->id,
            'name' => $room->name,
            'description' => $room->description,
            'room_code' => $room->room_code,
            'is_public' => (bool) $room->is_public,
            'max_capacity' => (int) $room->max_capacity,
            'music_preset' => $room->music_preset,
            'status' => $room->status,
            'current_pomodoro_phase' => $room->current_pomodoro_phase,
            'pomodoro_started_at' => optional($room->pomodoro_started_at)?->toISOString(),
            'online_members_count' => $onlineMembers->count(),
            'members_count' => $members->count(),
            'is_member' => (bool) $viewerMember,
            'is_host' => $room->creator_id === $viewerId,
            'creator' => $room->creator ? [
                'id' => $room->creator->id,
                'name' => $room->creator->name,
                'username' => $room->creator->username,
                'avatar_url' => $room->creator->avatar_url,
            ] : null,
            'online_members_preview' => $onlineMembers->take(5)->map(function ($m) {
                return [
                    'id' => $m['id'],
                    'name' => $m['name'],
                    'username' => $m['username'],
                    'avatar_url' => $m['avatar_url'],
                ];
            })->values(),
        ];

        if ($compact) {
            return $base;
        }

        return array_merge($base, [
            'members' => $members,
        ]);
    }
}
