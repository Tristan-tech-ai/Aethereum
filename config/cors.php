<?php

$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
$csvOrigins = env('CORS_ALLOWED_ORIGINS', '');
$extraOrigins = array_filter(array_map('trim', explode(',', $csvOrigins)));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter([
        $frontendUrl,
        'https://nexera.dedyn.io',
        'https://www.nexera.dedyn.io',
        'https://nexera-nine.vercel.app',
        ...$extraOrigins,
    ]))),

    'allowed_origins_patterns' => [
        '/^https:\/\/([a-z0-9-]+\.)?dedyn\.io$/',
        '/^https:\/\/([a-z0-9-]+\.)?vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,

];
