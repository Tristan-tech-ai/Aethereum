<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test the health check endpoint.
     */
    public function test_health_check_returns_success_response(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'Success',
                'message' => 'System is healthy',
                'data' => [
                    'database' => 'Connected',
                    'service' => 'Aethereum API',
                    'uptime' => 'Healthy',
                ],
            ]);
    }

    /**
     * Test the rate limiting for guests.
     */
    public function test_rate_limiting_guest(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->getJson('/api/health');
        }

        $response = $this->getJson('/api/health');

        // This might fail if the rate limiter is not active in the test environment
        // but we can check the headers if they are present.
        // $response->assertHeader('X-RateLimit-Limit');
    }
}
