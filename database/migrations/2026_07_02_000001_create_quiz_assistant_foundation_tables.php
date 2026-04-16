<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('content_id')->constrained('learning_contents')->cascadeOnDelete();
            $table->foreignUuid('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->integer('section_index')->default(0);
            $table->string('section_title')->nullable();
            $table->string('status')->default('active');
            $table->integer('current_question_index')->default(0);
            $table->integer('correct_count')->default(0);
            $table->integer('total_questions')->default(0);
            $table->decimal('score_percentage', 5, 2)->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'content_id', 'status']);
            $table->index(['quiz_id', 'section_index']);
        });

        Schema::create('quiz_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quiz_session_id')->constrained('quiz_sessions')->cascadeOnDelete();
            $table->integer('question_index');
            $table->integer('selected_index');
            $table->boolean('is_correct')->default(false);
            $table->integer('time_taken_ms')->default(0);
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->index(['quiz_session_id', 'question_index']);
        });

        Schema::create('quiz_result_summaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quiz_session_id')->constrained('quiz_sessions')->cascadeOnDelete();
            $table->text('summary_text')->nullable();
            $table->integer('correct_count')->default(0);
            $table->integer('total_questions')->default(0);
            $table->decimal('score_percentage', 5, 2)->default(0);
            $table->boolean('passed')->default(false);
            $table->timestamps();

            $table->unique('quiz_session_id');
        });

        Schema::create('assistant_conversation_states', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('assistant_conversations')->cascadeOnDelete();
            $table->jsonb('state')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();

            $table->unique('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assistant_conversation_states');
        Schema::dropIfExists('quiz_result_summaries');
        Schema::dropIfExists('quiz_responses');
        Schema::dropIfExists('quiz_sessions');
    }
};
