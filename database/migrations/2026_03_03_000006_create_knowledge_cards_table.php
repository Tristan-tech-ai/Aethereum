<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('content_id')->nullable()->constrained('learning_contents')->nullOnDelete();
            $table->foreignUuid('session_id')->nullable()->constrained('learning_sessions')->nullOnDelete();

            // Card identity
            $table->string('title', 500);
            $table->string('subject_category', 100);
            $table->string('subject_icon', 50)->nullable();
            $table->string('subject_color', 7)->nullable();

            // Mastery metrics
            $table->integer('mastery_percentage')->default(0);
            $table->decimal('quiz_avg_score', 5, 2)->nullable();
            $table->decimal('focus_integrity', 5, 2)->nullable();
            $table->integer('time_invested')->default(0); // minutes

            // Card tier
            $table->string('tier', 20)->default('Bronze'); // Bronze|Silver|Gold|Diamond

            // Content
            $table->text('summary_snippet')->nullable();
            $table->jsonb('keywords')->nullable();

            // Social / display
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_public')->default(true);
            $table->integer('likes')->default(0);

            // Co-authored (Learning Relay)
            $table->boolean('is_collaborative')->default(false);
            $table->jsonb('collaborators')->nullable();

            // Integrity decay
            $table->timestamp('last_reviewed_at')->nullable();
            $table->decimal('integrity_decay_rate', 3, 2)->default(0.05);

            $table->timestamps();

            // Indexes
            $table->index('subject_category');
            $table->index('tier');
        });

        // Partial indexes (PostgreSQL)
        DB::statement('CREATE INDEX idx_cards_pinned ON knowledge_cards(user_id, is_pinned) WHERE is_pinned = true');
        DB::statement('CREATE INDEX idx_cards_public ON knowledge_cards(is_public) WHERE is_public = true');
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_cards');
    }
};
