<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        $databaseStatus = 'connected';
        $statusCode = 200;

        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $databaseStatus = 'error';
            $statusCode = 503;
        }

        return response()->json([
            'status' => $statusCode === 200 ? 'ok' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'database' => $databaseStatus,
            'version' => config('app.version', '1.0.0')
        ], $statusCode);
    }
}
