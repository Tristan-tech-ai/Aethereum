<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Aethereum API',
        'status' => 'Online',
        'frontend' => 'Connected via Decoupled React',
    ]);
})->name('home');

Route::get('/test-redis', function () {
    Cache::put('my_key', 'Hello Redis', 10);
    return Cache::get('my_key');
});
