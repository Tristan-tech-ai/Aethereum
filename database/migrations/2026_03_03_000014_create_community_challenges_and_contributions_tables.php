<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Challenge config
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('challenge_type', 50); // pages_read|focus_integrity|materials_completed|quiz_perfect|streak
            $table->string('subject_filter', 100)->nullable(); // null = all subjects
            $table->integer('goal_value');

            // Timing
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');

            // Progress
            $table->integer('current_value')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();

            // Rewards
            $table->integer('reward_coins')->default(100);
            $table->string('reward_badge_id', 50)->nullable();
            $table->string('reward_frame', 50)->nullable();

            $table->timestamps();

            $table->index(['starts_at', 'ends_at']);
        });

        Schema::create('challenge_contributions', function (Blueprint $table) {
            $table->foreignUuid('challenge_id')->constrained('community_challenges')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('contribution_value')->default(0);
            $table->boolean('reward_claimed')->default(false);

            $table->primary(['challenge_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_contributions');
        Schema::dropIfExists('community_challenges');
    }
};
