<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CommunityPost extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'post_type',
        'body',
        'image_url',
        'ref_id',
        'ref_meta',
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'ref_meta'      => 'array',
        'likes_count'   => 'integer',
        'comments_count'=> 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class, 'post_id')->latest();
    }

    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_likes', 'post_id', 'user_id');
    }
}
