<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->string('id', 50)->primary(); // 'first_steps'|'bookworm'|'quiz_master'|etc.
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable(); // emoji
            $table->string('category', 50)->nullable(); // learning|social|streak|special
            $table->jsonb('trigger_condition')->nullable(); // condition config for auto-awarding
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('achievement_id', 50);
            $table->foreign('achievement_id')->references('id')->on('achievements')->cascadeOnDelete();
            $table->timestamp('awarded_at')->useCurrent();
            $table->boolean('is_featured')->default(false);

            $table->unique(['user_id', 'achievement_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
