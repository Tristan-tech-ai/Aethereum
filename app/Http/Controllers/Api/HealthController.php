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
        try {
            DB::connection()->getPdo();

            return $this->success([
                'database' => 'Connected',
                'service' => 'Aethereum API',
                'uptime' => 'Healthy',
            ], 'System is healthy');
        } catch (\Exception $e) {
            return $this->error('Database connection failed: ' . $e->getMessage(), 500);
        }
    }
}
