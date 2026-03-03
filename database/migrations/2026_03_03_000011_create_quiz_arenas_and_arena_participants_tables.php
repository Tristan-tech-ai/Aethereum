<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_arenas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('host_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('content_id')->nullable()->constrained('learning_contents')->nullOnDelete();

            // Config
            $table->string('room_code', 6)->unique();
            $table->integer('max_players')->default(8);
            $table->integer('question_count')->default(10);
            $table->integer('time_per_question')->default(30); // seconds

            // Status
            $table->string('status', 50)->default('lobby'); // lobby|active|completed

            $table->timestamps();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->index('room_code');
            $table->index('status');
        });

        Schema::create('arena_participants', function (Blueprint $table) {
            $table->foreignUuid('arena_id')->constrained('quiz_arenas')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Results
            $table->integer('total_score')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('final_rank')->nullable();

            // Rewards
            $table->integer('xp_earned')->default(0);
            $table->integer('coins_earned')->default(0);

            $table->primary(['arena_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('arena_participants');
        Schema::dropIfExists('quiz_arenas');
    }
};
