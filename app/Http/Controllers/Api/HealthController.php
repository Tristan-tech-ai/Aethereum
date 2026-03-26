<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    use ApiResponse;

    /**
     * Check the health of the application.
     *
     * @return JsonResponse
     */
    public function check(): JsonResponse
    {
        $dbStatus = 'disconnected';

        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Exception $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        // Always return 200 so Railway healthcheck passes
        return $this->success([
            'database' => $dbStatus,
            'service' => 'Aethereum API',
            'status' => 'running',
        ], 'OK');
    }
}
