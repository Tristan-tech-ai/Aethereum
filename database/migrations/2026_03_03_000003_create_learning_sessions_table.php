<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('content_id')->constrained('learning_contents')->cascadeOnDelete();

            // Session config
            $table->string('flow_type', 50)->default('document_dungeon'); // document_dungeon|interactive_theater|scout_conquer|visual_quest|presentation_arena
            $table->integer('current_section')->default(0);
            $table->integer('total_sections')->default(0);

            // Time tracking
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('total_focus_time')->default(0); // seconds
            $table->integer('total_break_time')->default(0); // seconds

            // Focus metrics
            $table->decimal('focus_integrity', 5, 2)->default(100.00);
            $table->integer('tab_switches')->default(0);
            $table->integer('distraction_count')->default(0);

            // Quiz performance
            $table->decimal('quiz_avg_score', 5, 2)->nullable();
            $table->integer('quiz_attempts_total')->default(0);
            $table->integer('quiz_passes')->default(0);

            // Summary
            $table->text('user_summary')->nullable();
            $table->decimal('summary_score', 5, 2)->nullable();

            // Rewards
            $table->integer('xp_earned')->default(0);
            $table->integer('coins_earned')->default(0);

            // Status
            $table->string('status', 50)->default('active'); // active|paused|completed|abandoned
            $table->jsonb('progress_data')->nullable(); // flexible progress tracking

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_sessions');
    }
};
