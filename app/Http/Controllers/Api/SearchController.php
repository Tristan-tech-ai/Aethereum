<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->query('q');

        if (!$query || strlen($query) < 2) {
            return $this->error('Search query must be at least 2 characters', 400);
        }

        // ILIKE for PostgreSQL, LIKE for MySQL/SQLite
        // Using `like` with lower() for database agnostic case-insensitivity, 
        // or just rely on ILIKE if strictly postgreSQL
        // But since we use pgsql in .env, ILIKE is fine, but Laravel's standard is 'iLike' for pgsql or 'like' with lowers.
        // We'll use standard 'ilike'.
        
        $users = User::where('name', 'ilike', "%{$query}%")
            ->orWhere('username', 'ilike', "%{$query}%")
            ->orWhere('bio', 'ilike', "%{$query}%")
            ->limit(20)
            ->get(['id', 'name', 'username', 'avatar_url', 'level', 'rank']);

        return $this->success(['users' => $users], 'Search results retrieved');
    }
}
