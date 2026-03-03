<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_raids', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('content_id')->nullable()->constrained('learning_contents')->nullOnDelete();

            // Config
            $table->string('invite_code', 8)->unique();
            $table->integer('max_participants')->default(5);
            $table->integer('duration_minutes')->nullable();

            // Status
            $table->string('status', 50)->default('lobby'); // lobby|active|completed|abandoned

            // Results
            $table->decimal('team_score', 5, 2)->nullable();

            $table->timestamps();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->index('invite_code');
            $table->index('status');
        });

        Schema::create('raid_participants', function (Blueprint $table) {
            $table->foreignUuid('raid_id')->constrained('study_raids')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 20)->default('member'); // creator|member

            // Performance
            $table->integer('progress_percentage')->default(0);
            $table->decimal('quiz_score', 5, 2)->nullable();
            $table->decimal('focus_integrity', 5, 2)->nullable();

            // Rewards
            $table->integer('xp_earned')->default(0);
            $table->integer('coins_earned')->default(0);

            // Status
            $table->string('status', 50)->default('waiting'); // waiting|learning|completed|left
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();

            $table->primary(['raid_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raid_participants');
        Schema::dropIfExists('study_raids');
    }
};
