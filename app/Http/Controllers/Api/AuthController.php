<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

/**
 * AuthController — handles user data retrieval and operations
 * that still go through Laravel (profile, email verification, password reset).
 *
 * Authentication itself is handled by Supabase Auth + SupabaseAuth middleware.
 */
class AuthController extends Controller
{
    use ApiResponse;

    // ─── Get Authenticated User ───

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['wallet']);

        $stats = [
            'total_sessions'        => $user->total_sessions,
            'total_learning_hours'  => $user->total_learning_hours,
            'total_knowledge_cards' => $user->total_knowledge_cards,
            'xp_to_next_level'      => $user->xpToNextLevel(),
            'xp_needed_for_next'    => User::xpNeededForLevel($user->level + 1),
        ];

        return $this->success([
            'user'  => $this->formatUserResponse($user),
            'stats' => $stats,
        ]);
    }

    // ─── Logout (server-side cleanup if needed) ───

    public function logout(Request $request): JsonResponse
    {
        // With Supabase Auth, the frontend handles sign-out.
        // This endpoint exists for any server-side cleanup.
        // Revoke all Sanctum tokens if they still exist (migration period).
        if (method_exists($request->user(), 'tokens')) {
            $request->user()->tokens()->delete();
        }

        return $this->success(null, 'Logged out successfully');
    }

    // ─── Email Verification ───

    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return $this->error('Invalid verification link', 403);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email already verified');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return $this->success(null, 'Email verified successfully');
    }

    public function resendVerification(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->success(null, 'Email already verified');
        }

        $request->user()->sendEmailVerificationNotification();

        return $this->success(null, 'Verification link sent');
    }

    // ─── Password Reset ───

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success(null, 'Password reset link sent');
        }

        return $this->error(__($status), 422);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, 'Password reset successfully');
        }

        return $this->error(__($status), 422);
    }

    // ─── Helpers ───

    /**
     * Format user response with consistent structure.
     */
    private function formatUserResponse(User $user): array
    {
        return [
            'id'                      => $user->id,
            'name'                    => $user->name,
            'email'                   => $user->email,
            'username'                => $user->username,
            'avatar_url'              => $user->avatar_url,
            'bio'                     => $user->bio,
            'xp'                      => $user->xp,
            'level'                   => $user->level,
            'rank'                    => $user->rank,
            'current_streak'          => $user->current_streak,
            'longest_streak'          => $user->longest_streak,
            'streak_freeze_available' => $user->streak_freeze_available,
            'weekly_goal'             => $user->weekly_goal,
            'total_xp_ever'           => $user->total_xp_ever,
            'total_learning_hours'    => $user->total_learning_hours,
            'total_sessions'          => $user->total_sessions,
            'total_knowledge_cards'   => $user->total_knowledge_cards,
            'is_profile_public'       => $user->is_profile_public,
            'show_on_leaderboard'     => $user->show_on_leaderboard,
            'email_verified_at'       => $user->email_verified_at,
            'last_login_at'           => $user->last_login_at,
            'created_at'              => $user->created_at,
            'wallet'                  => $user->wallet ? [
                'current_balance' => $user->wallet->current_balance,
                'total_earned'    => $user->wallet->total_earned,
                'total_spent'     => $user->wallet->total_spent,
                'daily_earned'    => $user->wallet->daily_earned,
                'daily_cap'       => $user->wallet->daily_cap,
            ] : null,
        ];
    }
}
