<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Conversations ────────────────────────────────
        Schema::create('assistant_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('context_type')->nullable(); // session|content|profile|general
            $table->uuid('context_id')->nullable();
            $table->string('status')->default('active'); // active|archived
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        // ── Messages ─────────────────────────────────────
        Schema::create('assistant_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')
                  ->constrained('assistant_conversations')
                  ->cascadeOnDelete();
            $table->string('role'); // user|assistant|system
            $table->text('content');
            $table->string('model')->nullable();
            $table->unsignedInteger('prompt_tokens')->nullable();
            $table->unsignedInteger('completion_tokens')->nullable();
            $table->unsignedInteger('latency_ms')->nullable();
            $table->boolean('safety_flagged')->default(false);
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });

        // ── Preferences ──────────────────────────────────
        Schema::create('assistant_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('tone')->default('friendly'); // friendly|strict|motivational
            $table->string('language')->default('auto');  // auto|id|en
            $table->string('goal_style')->default('task'); // task|milestone|habit
            $table->boolean('notification_opt_in')->default(true);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assistant_messages');
        Schema::dropIfExists('assistant_conversations');
        Schema::dropIfExists('assistant_preferences');
    }
};
