<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_contents', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->index()->after('status');
            $table->unsignedInteger('coin_price')->default(0)->after('is_public');
            $table->boolean('is_pro')->default(false)->index()->after('coin_price');
        });
    }

    public function down(): void
    {
        Schema::table('learning_contents', function (Blueprint $table) {
            $table->dropColumn(['is_public', 'coin_price', 'is_pro']);
        });
    }
};
