<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_relays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('content_id')->nullable()->constrained('learning_contents')->nullOnDelete();

            // Config
            $table->string('invite_code', 8)->unique();
            $table->integer('max_participants')->default(7);

            // Status
            $table->string('status', 50)->default('lobby'); // lobby|active|summary|quiz|completed

            // Results
            $table->text('combined_summary')->nullable();

            $table->timestamps();
            $table->timestamp('completed_at')->nullable();

            $table->index('invite_code');
            $table->index('status');
        });

        Schema::create('relay_participants', function (Blueprint $table) {
            $table->foreignUuid('relay_id')->constrained('learning_relays')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Assignment
            $table->integer('section_index');
            $table->text('section_content')->nullable();

            // Progress
            $table->text('section_summary')->nullable();
            $table->boolean('section_completed')->default(false);
            $table->decimal('quiz_score', 5, 2)->nullable();

            // Rewards
            $table->integer('xp_earned')->default(0);
            $table->integer('coins_earned')->default(0);

            $table->primary(['relay_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relay_participants');
        Schema::dropIfExists('learning_relays');
    }
};
