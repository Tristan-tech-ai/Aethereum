<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('xp_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Event details
            $table->integer('xp_amount');
            $table->string('source', 100); // section_complete|quiz_pass|quiz_perfect|summary|daily_login|raid_bonus|duel_win|etc.
            $table->text('description')->nullable();

            // Related entities
            $table->uuid('session_id')->nullable();
            $table->uuid('social_session_id')->nullable(); // raid/duel/arena/relay id

            // Snapshot
            $table->integer('level_before')->nullable();
            $table->integer('level_after')->nullable();
            $table->integer('xp_before')->nullable();
            $table->integer('xp_after')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index(['user_id', 'created_at'], 'idx_xp_events_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xp_events');
    }
};
