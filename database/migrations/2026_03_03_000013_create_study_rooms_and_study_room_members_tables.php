<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('creator_id')->constrained('users')->cascadeOnDelete();

            // Config
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('room_code', 8)->unique()->nullable();
            $table->boolean('is_public')->default(true);
            $table->integer('max_capacity')->default(20);
            $table->string('music_preset', 50)->default('lofi'); // lofi|classical|nature|silence

            // Status
            $table->string('status', 50)->default('active'); // active|closed
            $table->string('current_pomodoro_phase', 20)->default('study'); // study|break
            $table->timestamp('pomodoro_started_at')->nullable();

            $table->timestamps();
            $table->timestamp('closed_at')->nullable();

            $table->index('room_code');
            $table->index(['is_public', 'status']);
        });

        Schema::create('study_room_members', function (Blueprint $table) {
            $table->foreignUuid('room_id')->constrained('study_rooms')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Presence
            $table->boolean('is_online')->default(true);
            $table->string('current_material', 500)->nullable();
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('last_active_at')->useCurrent();

            // XP earned in this session
            $table->integer('xp_earned')->default(0);

            $table->primary(['room_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_room_members');
        Schema::dropIfExists('study_rooms');
    }
};
