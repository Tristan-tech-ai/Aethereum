<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\QuizSession;

class ValidateQuizSessionOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionId = $request->route('sessionId');

        if (!$sessionId) {
            return response()->json(['message' => 'Parameter sessionId tidak ditemukan.'], 400);
        }

        $session = QuizSession::find($sessionId);

        if (!$session) {
            return response()->json(['message' => 'Sesi quiz tidak ditemukan.'], 404);
        }

        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Kamu tidak memiliki akses ke sesi ini.'], 403);
        }

        if ($session->status === 'expired') {
            return response()->json([
                'success' => false,
                'error_code' => 'SESSION_EXPIRED',
                'message' => 'Sesi quiz sudah kedaluwarsa.',
                'data' => [ 'can_restart' => true ]
            ], 410);
        }

        $request->merge(['quiz_session' => $session]);

        return $next($request);
    }
}
