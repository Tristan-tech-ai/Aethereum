<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UpdateSettingsRequest;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ProfileController extends Controller
{
    use ApiResponse;

    // ─── Update Profile ───

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update($data);

        return $this->success([
            'user' => $this->formatProfile($user->fresh()),
        ], 'Profile updated successfully');
    }

    // ─── Upload Avatar ───

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $request->user();

        // Delete old avatar if it exists
        if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
            Storage::disk('public')->delete($user->avatar_url);
        }

        $file = $request->file('avatar');

        // Resize and crop to 256x256
        try {
            $image = Image::read($file);
            $image->cover(256, 256);
            
            $filename = 'avatars/' . $user->id . '_' . time() . '.webp';
            
            Storage::disk('public')->put($filename, $image->toWebp(85));
        } catch (\Exception $e) {
            // Fallback: store original without resize if Intervention Image not available
            $filename = $file->store('avatars', 'public');
        }

        $user->update(['avatar_url' => $filename]);

        return $this->success([
            'avatar_url' => $filename,
            'full_url'   => asset('storage/' . $filename),
        ], 'Avatar uploaded successfully');
    }

    // ─── Update Settings ───

    public function updateSettings(UpdateSettingsRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update($data);

        return $this->success([
            'settings' => [
                'is_profile_public'   => $user->is_profile_public,
                'show_on_leaderboard' => $user->show_on_leaderboard,
                'weekly_goal'         => $user->weekly_goal,
            ],
        ], 'Settings updated successfully');
    }

    // ─── Helpers ───

    private function formatProfile($user): array
    {
        return [
            'id'                    => $user->id,
            'name'                  => $user->name,
            'email'                 => $user->email,
            'username'              => $user->username,
            'avatar_url'            => $user->avatar_url,
            'bio'                   => $user->bio,
            'xp'                    => $user->xp,
            'level'                 => $user->level,
            'rank'                  => $user->rank,
            'current_streak'        => $user->current_streak,
            'longest_streak'        => $user->longest_streak,
            'weekly_goal'           => $user->weekly_goal,
            'is_profile_public'     => $user->is_profile_public,
            'show_on_leaderboard'   => $user->show_on_leaderboard,
            'email_verified_at'     => $user->email_verified_at,
        ];
    }
}
