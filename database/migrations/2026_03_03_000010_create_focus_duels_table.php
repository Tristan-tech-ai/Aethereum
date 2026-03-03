<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('focus_duels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('challenger_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('opponent_id')->constrained('users')->cascadeOnDelete();

            // Config
            $table->integer('duration_minutes'); // 25|50|90

            // Results
            $table->decimal('challenger_focus_integrity', 5, 2)->nullable();
            $table->decimal('opponent_focus_integrity', 5, 2)->nullable();
            $table->foreignUuid('winner_id')->nullable()->constrained('users')->nullOnDelete();

            // Status
            $table->string('status', 50)->default('pending'); // pending|accepted|active|completed|declined|expired

            $table->timestamps();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('focus_duels');
    }
};
