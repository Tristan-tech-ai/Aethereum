<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\UserWallet;
use App\Models\CoinTransaction;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    use ApiResponse;

    // ─── Register ───

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $username = $this->generateUniqueUsername($data['name']);

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'username' => $username,
                'level'    => 1,
                'rank'     => 'Seedling',
                'xp'       => 0,
                'total_xp_ever' => 0,
            ]);

            // Auto-create wallet with 100 coin welcome bonus
            $wallet = UserWallet::create([
                'user_id'         => $user->id,
                'current_balance' => 100,
                'total_earned'    => 100,
                'total_spent'     => 0,
                'daily_earned'    => 0,
                'daily_cap'       => 500,
                'daily_cap_reset_date' => now()->toDateString(),
            ]);

            CoinTransaction::create([
                'wallet_id'        => $wallet->id,
                'amount'           => 100,
                'type'             => 'earn',
                'source'           => 'welcome_bonus',
                'description'      => 'Welcome bonus for joining Aethereum!',
                'balance_after'    => 100,
            ]);

            return $user;
        });

        // 7-day token expiry
        $token = $user->createToken('api-token', ['*'], now()->addDays(7))->plainTextToken;

        // Send email verification
        event(new Registered($user));

        $user->load('wallet');

        return $this->success([
            'user'  => $this->formatUserResponse($user),
            'token' => $token,
        ], 'Registration successful', 201);
    }

    // ─── Login ───

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            return $this->error('Invalid credentials', 401);
        }

        $user = Auth::user();

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        // 7-day token expiry
        $token = $user->createToken('api-token', ['*'], now()->addDays(7))->plainTextToken;

        $user->load('wallet');

        return $this->success([
            'user'  => $this->formatUserResponse($user),
            'token' => $token,
        ], 'Login successful');
    }

    // ─── Logout ───

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    // ─── Get Authenticated User ───

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['wallet', 'achievements.achievement', 'pinnedCards']);

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

    // ─── Google OAuth ───

    public function googleRedirect(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return $this->success(['url' => $url], 'Redirect to Google');
    }

    public function googleCallback(Request $request): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return $this->error('Google authentication failed: ' . $e->getMessage(), 401);
        }

        $user = DB::transaction(function () use ($googleUser) {
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            $isNew = false;

            if (!$user) {
                $isNew = true;
                $username = $this->generateUniqueUsername($googleUser->getName());

                $user = User::create([
                    'name'       => $googleUser->getName(),
                    'email'      => $googleUser->getEmail(),
                    'google_id'  => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                    'username'   => $username,
                    'password'   => Hash::make(Str::random(32)),
                    'email_verified_at' => now(),
                    'level'      => 1,
                    'rank'       => 'Seedling',
                    'xp'         => 0,
                    'total_xp_ever' => 0,
                ]);
            } else {
                // Link Google ID if not already linked
                $user->update([
                    'google_id'  => $googleUser->getId(),
                    'avatar_url' => $user->avatar_url ?: $googleUser->getAvatar(),
                ]);
            }

            // Mark email as verified for OAuth users
            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
                event(new Verified($user));
            }

            // Create wallet for new users
            if ($isNew) {
                $wallet = UserWallet::create([
                    'user_id'         => $user->id,
                    'current_balance' => 100,
                    'total_earned'    => 100,
                    'total_spent'     => 0,
                    'daily_earned'    => 0,
                    'daily_cap'       => 500,
                    'daily_cap_reset_date' => now()->toDateString(),
                ]);

                CoinTransaction::create([
                    'wallet_id'     => $wallet->id,
                    'amount'        => 100,
                    'type'          => 'earn',
                    'source'        => 'welcome_bonus',
                    'description'   => 'Welcome bonus for joining Aethereum!',
                    'balance_after' => 100,
                ]);
            }

            $user->update(['last_login_at' => now()]);

            return $user;
        });

        $token = $user->createToken('api-token', ['*'], now()->addDays(7))->plainTextToken;
        $user->load('wallet');

        return $this->success([
            'user'  => $this->formatUserResponse($user),
            'token' => $token,
        ], 'Google authentication successful');
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

                // Revoke all tokens on password reset
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, 'Password reset successfully');
        }

        return $this->error(__($status), 422);
    }

    // ─── Helpers ───

    /**
     * Generate a unique username from a full name.
     * e.g., "Andi Pratama" → "andi_pratama", "andi_pratama_1", etc.
     */
    private function generateUniqueUsername(string $name): string
    {
        $base = Str::slug($name, '_');
        $base = Str::limit($base, 40, '');

        if (!$base) {
            $base = 'user';
        }

        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . '_' . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Format user response with consistent structure.
     */
    private function formatUserResponse(User $user): array
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
            'streak_freeze_available' => $user->streak_freeze_available,
            'weekly_goal'           => $user->weekly_goal,
            'total_xp_ever'         => $user->total_xp_ever,
            'total_learning_hours'  => $user->total_learning_hours,
            'total_sessions'        => $user->total_sessions,
            'total_knowledge_cards' => $user->total_knowledge_cards,
            'is_profile_public'     => $user->is_profile_public,
            'show_on_leaderboard'   => $user->show_on_leaderboard,
            'email_verified_at'     => $user->email_verified_at,
            'last_login_at'         => $user->last_login_at,
            'created_at'            => $user->created_at,
            'wallet'                => $user->wallet ? [
                'current_balance' => $user->wallet->current_balance,
                'total_earned'    => $user->wallet->total_earned,
                'total_spent'     => $user->wallet->total_spent,
                'daily_earned'    => $user->wallet->daily_earned,
                'daily_cap'       => $user->wallet->daily_cap,
            ] : null,
        ];
    }
}
