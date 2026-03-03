<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // User wallets — 1 per user
        Schema::create('user_wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();

            $table->integer('current_balance')->default(0);
            $table->integer('total_earned')->default(0);
            $table->integer('total_spent')->default(0);

            // Daily cap tracking
            $table->integer('daily_earned')->default(0);
            $table->integer('daily_cap')->default(500);
            $table->date('daily_cap_reset_date')->nullable();

            $table->timestamps();
        });

        // Coin transactions — log every earn/spend
        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('wallet_id')->constrained('user_wallets')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('type', 20); // earn|spend
            $table->integer('amount');
            $table->integer('balance_after');
            $table->string('source', 100); // session_complete|duel_win|streak_bonus|welcome_bonus|profile_frame_purchase|etc.
            $table->text('description')->nullable();

            // Reference to related entity
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type', 50)->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coin_transactions');
        Schema::dropIfExists('user_wallets');
    }
};
