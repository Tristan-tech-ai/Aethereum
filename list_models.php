<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Quick test of callChat with fallback
$svc = app(\App\Services\GeminiService::class);
try {
    $result = $svc->callChat('Respond with JSON: {"message": "Hello from Nexara!"}', 0.7, 128);
    echo "SUCCESS! Model responded.\n";
    echo "Message: " . ($result['data']['message'] ?? 'N/A') . "\n";
    echo "Tokens: prompt=" . ($result['usage']['prompt_tokens'] ?? '?') . " completion=" . ($result['usage']['completion_tokens'] ?? '?') . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
