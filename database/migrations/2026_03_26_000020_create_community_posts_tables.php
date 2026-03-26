<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Community Posts ───────────────────────────────────────────
        Schema::create('community_posts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(\DB::raw('gen_random_uuid()'));
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // 'text' | 'image' | 'raid_invite' | 'duel_invite'
            $table->string('post_type', 20)->default('text');

            $table->text('body')->nullable();
            $table->text('image_url')->nullable();

            // For raid_invite / duel_invite — ref_id points to the raid/duel, ref_meta holds display info
            $table->uuid('ref_id')->nullable();
            $table->jsonb('ref_meta')->default('{}');

            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        // ─── Post Likes ────────────────────────────────────────────────
        Schema::create('post_likes', function (Blueprint $table) {
            $table->foreignUuid('post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->primary(['post_id', 'user_id']);
        });

        // ─── Post Comments ─────────────────────────────────────────────
        Schema::create('post_comments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(\DB::raw('gen_random_uuid()'));
            $table->foreignUuid('post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['post_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_comments');
        Schema::dropIfExists('post_likes');
        Schema::dropIfExists('community_posts');
    }
};
