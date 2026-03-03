<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feed_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Event
            $table->string('event_type', 50); // rank_up|achievement|streak_milestone|raid_complete|challenge_complete
            $table->jsonb('event_data')->nullable();

            // Social
            $table->integer('likes')->default(0);

            // Visibility
            $table->boolean('is_public')->default(true);

            $table->timestamp('created_at')->useCurrent();

            $table->index(['created_at'], 'idx_feed_events_date');
            $table->index('user_id');
        });

        Schema::create('feed_likes', function (Blueprint $table) {
            $table->foreignUuid('event_id')->constrained('feed_events')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            $table->primary(['event_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feed_likes');
        Schema::dropIfExists('feed_events');
    }
};
