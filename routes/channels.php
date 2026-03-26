<?php

use App\Models\FocusDuel;
use App\Models\LearningRelay;
use App\Models\QuizArena;
use App\Models\StudyRaid;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Personal notifications channel
Broadcast::channel('user.{userId}', function (User $user, string $userId) {
    return $user->id === $userId;
});

// Study Raid channel — only participants can listen
Broadcast::channel('raid.{raidId}', function (User $user, string $raidId) {
    $raid = StudyRaid::find($raidId);
    if (!$raid) return false;
    return $raid->creator_id === $user->id || $raid->participants()->where('user_id', $user->id)->exists();
});

// Focus Duel channel — only challenger and opponent
Broadcast::channel('duel.{duelId}', function (User $user, string $duelId) {
    $duel = FocusDuel::find($duelId);
    if (!$duel) return false;
    return $duel->challenger_id === $user->id || $duel->opponent_id === $user->id;
});

// Quiz Arena channel — only participants
Broadcast::channel('arena.{arenaId}', function (User $user, string $arenaId) {
    $arena = QuizArena::find($arenaId);
    if (!$arena) return false;
    return $arena->host_id === $user->id || $arena->participants()->where('user_id', $user->id)->exists();
});

// Learning Relay channel — only participants
Broadcast::channel('relay.{relayId}', function (User $user, string $relayId) {
    $relay = LearningRelay::find($relayId);
    if (!$relay) return false;
    return $relay->creator_id === $user->id || $relay->participants()->where('user_id', $user->id)->exists();
});

// Study Room presence channel — returns user data for presence
Broadcast::channel('room.{roomId}', function (User $user, string $roomId) {
    $room = StudyRoom::find($roomId);
    if (!$room) return false;
    if ($room->members()->where('user_id', $user->id)->exists()) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
        ];
    }
    return false;
});
