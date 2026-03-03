<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Quizzes — generated per section
        Schema::create('quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('content_id')->constrained('learning_contents')->cascadeOnDelete();
            $table->integer('section_index')->default(0);

            // Quiz data
            $table->jsonb('questions'); // array of {question, options[], correct_index, explanation}
            $table->integer('question_count')->default(5);
            $table->string('difficulty', 20)->default('medium'); // easy|medium|hard
            $table->integer('time_limit_seconds')->default(120); // per question
            $table->integer('pass_threshold')->default(70); // percentage

            $table->timestamps();

            $table->index(['content_id', 'section_index']);
        });

        // Quiz attempts — per user per quiz
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('session_id')->nullable()->constrained('learning_sessions')->cascadeOnDelete();

            // Answers
            $table->jsonb('answers'); // array of {question_index, selected_index, is_correct, time_taken_ms}
            $table->integer('correct_count')->default(0);
            $table->integer('total_questions')->default(0);
            $table->decimal('score_percentage', 5, 2)->default(0);
            $table->boolean('passed')->default(false);

            $table->integer('time_taken_seconds')->default(0);

            $table->timestamps();

            $table->index(['user_id', 'quiz_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quizzes');
    }
};
