<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Content info
            $table->string('title', 500);
            $table->string('content_type', 50); // pdf|youtube|article|image|pptx
            $table->string('original_filename', 500)->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('source_url', 2000)->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->integer('estimated_duration')->nullable(); // minutes
            $table->integer('total_pages')->nullable();
            $table->string('language', 10)->default('id');

            // AI Analysis
            $table->jsonb('ai_analysis')->nullable(); // full Gemini analysis result
            $table->jsonb('structured_sections')->nullable(); // parsed sections for quest map
            $table->string('subject_category', 100)->nullable();
            $table->string('subject_icon', 50)->nullable();
            $table->string('subject_color', 7)->nullable();
            $table->string('difficulty', 20)->nullable(); // beginner|intermediate|advanced

            // Status
            $table->string('status', 50)->default('processing'); // processing|ready|failed
            $table->text('error_message')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('content_type');
            $table->index('subject_category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_contents');
    }
};
