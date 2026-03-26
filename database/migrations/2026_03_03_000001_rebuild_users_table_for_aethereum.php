<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old dependent tables first
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');

        // Recreate users table with UUID PK and all Aethereum fields
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255)->unique();
            $table->string('password', 255)->nullable();
            $table->string('name', 255);
            $table->string('username', 50)->unique();
            $table->string('avatar_url', 500)->nullable();
            $table->text('bio')->nullable();

            // Two-factor auth (Fortify)
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();

            // Gamification — Knowledge Profile
            $table->integer('xp')->default(0);
            $table->integer('level')->default(1);
            $table->string('rank', 50)->default('Bronze'); // Bronze|Silver|Gold|Platinum|Emerald|Diamond

            // Streak
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->boolean('streak_freeze_available')->default(true);
            $table->date('last_learning_date')->nullable();
            $table->integer('weekly_goal')->default(5);

            // Aggregate stats
            $table->integer('total_xp_ever')->default(0);
            $table->integer('total_learning_hours')->default(0);
            $table->integer('total_sessions')->default(0);
            $table->integer('total_knowledge_cards')->default(0);

            // Privacy
            $table->boolean('is_profile_public')->default(true);
            $table->boolean('show_on_leaderboard')->default(false);

            // OAuth
            $table->string('google_id', 255)->unique()->nullable();

            // Timestamps
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->timestamp('last_login_at')->nullable();

            // Indexes
            $table->index('level');
            $table->index('rank');
        });

        // Partial index for leaderboard (PostgreSQL)
        DB::statement('CREATE INDEX idx_users_leaderboard ON users(show_on_leaderboard, xp) WHERE show_on_leaderboard = true');

        // Recreate password_reset_tokens
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Recreate sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index()->constrained('users')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Recreate personal_access_tokens with UUID tokenable
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuidMorphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');

        // Restore original users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }
};
