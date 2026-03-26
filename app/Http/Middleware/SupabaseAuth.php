<?php

namespace App\Http\Middleware;

use App\Models\CoinTransaction;
use App\Models\User;
use App\Models\UserWallet;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware that validates a Supabase JWT from the Authorization header
 * and resolves (or auto-creates) the corresponding local User.
 */
class SupabaseAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $decoded = null;

        try {
            $secret = config('services.supabase.jwt_secret');
            if ($secret) {
                // Supabase JWT secret is base64-encoded. Decode to raw bytes.
                $rawSecret = base64_decode($secret);
                $decoded = JWT::decode($token, new Key($rawSecret, 'HS256'));
            }
        } catch (\Exception $e) {
            // Try with the raw (non-decoded) secret as fallback.
            try {
                $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            } catch (\Exception $e2) {
                // Both failed — will fallback to Supabase HTTP endpoint.
                $decoded = null;
            }
        }

        if (!$decoded) {
            $supabaseUser = $this->fetchSupabaseUser($token);

            if (!$supabaseUser) {
                return response()->json(['message' => 'Invalid or expired token.'], 401);
            }

            $decoded = (object) [
                'sub' => $supabaseUser->id ?? null,
                'email' => $supabaseUser->email ?? null,
                'user_metadata' => (object) ($supabaseUser->user_metadata ?? []),
                'email_confirmed_at' => $supabaseUser->email_confirmed_at ?? null,
            ];
        }

        // Supabase JWT 'sub' claim is the user UUID
        $supabaseId = $decoded->sub ?? null;
        if (!$supabaseId) {
            return response()->json(['message' => 'Invalid token payload.'], 401);
        }

        // Find existing user by supabase_id, or by email as fallback
        $email = $decoded->email ?? null;
        $user = User::where('supabase_id', $supabaseId)->first();

        if (!$user && $email) {
            // Check if a user with this email already exists (e.g., from old Sanctum auth)
            $user = User::where('email', $email)->first();
            if ($user) {
                // Link the Supabase ID to the existing user
                $user->update(['supabase_id' => $supabaseId]);
            }
        }

        if (!$user) {
            $user = $this->createUserFromSupabase($decoded);
        }

        // Update last login at most once per hour to avoid write on every request.
        if (!$user->last_login_at || $user->last_login_at->diffInMinutes(now()) >= 60) {
            $user->updateQuietly(['last_login_at' => now()]);
        }

        // Set the authenticated user for the request
        $request->setUserResolver(fn () => $user);
        auth()->setUser($user);

        return $next($request);
    }

    /**
     * Auto-create a local user from Supabase JWT claims.
     * Also creates the wallet with welcome bonus.
     */
    private function createUserFromSupabase(object $decoded): User
    {
        $meta = $decoded->user_metadata ?? (object) [];
        $name = $meta->name ?? $meta->full_name ?? null;
        $email = $decoded->email ?? null;

        if (!$name && $email) {
            $name = explode('@', $email)[0];
        }
        if (!$name) {
            $name = 'User';
        }

        return DB::transaction(function () use ($decoded, $name, $meta, $email) {
            $username = $this->generateUniqueUsername($name);

            $user = User::create([
                'supabase_id'       => $decoded->sub,
                'name'              => $name,
                'email'             => $email,
                'username'          => $username,
                'avatar_url'        => $meta->avatar_url ?? $meta->picture ?? null,
                'email_verified_at' => !empty($decoded->email_confirmed_at) ? now() : null,
                'password'          => Hash::make(Str::random(32)),
                'level'             => 1,
                'rank'              => 'Seedling',
                'xp'                => 0,
                'total_xp_ever'     => 0,
            ]);

            $wallet = UserWallet::create([
                'user_id'              => $user->id,
                'current_balance'      => 100,
                'total_earned'         => 100,
                'total_spent'          => 0,
                'daily_earned'         => 0,
                'daily_cap'            => 500,
                'daily_cap_reset_date' => now()->toDateString(),
            ]);

            CoinTransaction::create([
                'wallet_id'     => $wallet->id,
                'user_id'       => $user->id,
                'amount'        => 100,
                'type'          => 'earn',
                'source'        => 'welcome_bonus',
                'description'   => 'Welcome bonus for joining Nexera!',
                'balance_after' => 100,
            ]);

            return $user;
        });
    }

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

    private function fetchSupabaseUser(string $token): ?object
    {
        $supabaseUrl = config('services.supabase.url');
        $anonKey = config('services.supabase.anon_key');

        if (!$supabaseUrl || !$anonKey) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'apikey' => $anonKey,
                'Authorization' => 'Bearer ' . $token,
            ])->get(rtrim($supabaseUrl, '/') . '/auth/v1/user');

            if (!$response->successful()) {
                return null;
            }

            return (object) $response->json();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
