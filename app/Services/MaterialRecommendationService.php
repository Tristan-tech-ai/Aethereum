<?php

namespace App\Services;

use App\Models\LearningContent;
use App\Models\LearningSession;
use Illuminate\Database\Eloquent\Collection;

class MaterialRecommendationService
{
    /**
     * Find learning contents based on an extracted hint.
     *
     * @param string $hint
     * @param int|string $userId
     * @param int $limit
     * @return Collection
     */
    public function findByHint(string $hint, $userId, int $limit = 5): Collection
    {
        return LearningContent::where('user_id', $userId)
            ->where(function ($query) use ($hint) {
                $query->where('title', 'LIKE', "%{$hint}%")
                      ->orWhere('subject_category', 'LIKE', "%{$hint}%")
                      ->orWhere('original_filename', 'LIKE', "%{$hint}%");
            })

            ->orderByRaw("CASE 
                WHEN title = ? THEN 1 
                WHEN title LIKE ? THEN 2 
                ELSE 3 
            END", [$hint, "{$hint}%"])
            ->limit($limit)
            ->get();
    }

    /**
     * Fallback to find relevant content for user.
     *
     * @param int|string $userId
     * @param int $limit
     * @return Collection
     */
    public function findRelevantForUser($userId, int $limit = 5): Collection
    {
        $activeContentIds = LearningSession::where('user_id', $userId)
            ->where('status', 'active')
            ->pluck('content_id')
            ->toArray();

        if (!empty($activeContentIds)) {
            $contents = LearningContent::where('user_id', $userId)
                ->whereIn('id', $activeContentIds)
                ->limit($limit)
                ->get();

            if ($contents->isNotEmpty()) {
                return $contents;
            }
        }

        // Fallback to recent content
        return LearningContent::where('user_id', $userId)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Parse structured_sections JSON.
     *
     * @param LearningContent $content
     * @return array
     */
    public function getSectionsFromContent(LearningContent $content): array
    {
        $sections = $content->structured_sections ?? [];
        $result = [];

        foreach ($sections as $index => $section) {
            $contentStr = $section['content'] ?? '';
            $result[] = [
                'index' => $index,
                'title' => $section['title'] ?? "Section " . ($index + 1),
                'preview' => mb_substr(strip_tags($contentStr), 0, 100),
            ];
        }

        return $result;
    }

    /**
     * Validate and retrieve a content by its ID.
     *
     * @param int|string $contentId
     * @return LearningContent|null
     */
    public function validateContentId($contentId): ?LearningContent
    {
        return LearningContent::find($contentId);
    }
}
