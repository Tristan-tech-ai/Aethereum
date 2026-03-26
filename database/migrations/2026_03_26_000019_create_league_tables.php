<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── League Seasons ──────────────────────────────────────────────
        Schema::create('league_seasons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index('is_active');
        });

        // ── League Blocks (each holds up to 50 players per tier per season) ──
        Schema::create('league_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained('league_seasons')->cascadeOnDelete();
            $table->string('tier'); // Bronze, Silver, Gold, Platinum, Emerald, Diamond
            $table->timestamps();

            $table->index(['season_id', 'tier']);
        });

        // ── League Memberships ──────────────────────────────────────────
        Schema::create('league_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('block_id')->constrained('league_blocks')->cascadeOnDelete();
            $table->foreignId('season_id')->constrained('league_seasons')->cascadeOnDelete();
            $table->integer('xp_earned')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'season_id']); // one block per user per season
            $table->index(['block_id', 'xp_earned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('league_memberships');
        Schema::dropIfExists('league_blocks');
        Schema::dropIfExists('league_seasons');
    }
};
