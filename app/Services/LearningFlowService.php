<?php

namespace App\Services;

use App\Models\LearningContent;

class LearningFlowService
{
    /**
     * Flow-type mapping based on content type.
     */
    private const FLOW_MAP = [
        'pdf'     => 'document_dungeon',
        'article' => 'document_dungeon',
        'pptx'    => 'presentation_arena',
        'youtube' => 'interactive_theater',
        'image'   => 'visual_quest',
    ];

    /**
     * Default config per flow type.
     */
    private const FLOW_CONFIGS = [
        'document_dungeon' => [
            'min_reading_time_per_section' => 60,   // seconds
            'max_hearts'                   => 3,
            'focus_penalty_per_switch'     => 15.0,  // integrity % lost
            'quiz_questions_per_section'   => 5,
            'quiz_pass_threshold'          => 70,
            'summary_min_chars'            => 100,
            'focus_report_interval'        => 30,    // seconds
        ],
        'interactive_theater' => [
            'min_watch_time_per_section' => 120,
            'max_hearts'                => 3,
            'focus_penalty_per_switch'  => 10.0,
            'quiz_questions_per_section'=> 5,
            'quiz_pass_threshold'       => 70,
            'summary_min_chars'         => 100,
            'focus_report_interval'     => 30,
        ],
        'presentation_arena' => [
            'min_reading_time_per_section' => 45,
            'max_hearts'                   => 3,
            'focus_penalty_per_switch'     => 15.0,
            'quiz_questions_per_section'   => 5,
            'quiz_pass_threshold'          => 70,
            'summary_min_chars'            => 80,
            'focus_report_interval'        => 30,
        ],
        'visual_quest' => [
            'min_reading_time_per_section' => 30,
            'max_hearts'                   => 3,
            'focus_penalty_per_switch'     => 15.0,
            'quiz_questions_per_section'   => 3,
            'quiz_pass_threshold'          => 70,
            'summary_min_chars'            => 60,
            'focus_report_interval'        => 30,
        ],
    ];

    /**
     * Select the correct learning flow based on content type.
     */
    public function selectFlow(LearningContent $content): string
    {
        return self::FLOW_MAP[$content->content_type] ?? 'document_dungeon';
    }

    /**
     * Return the full config for a Document Dungeon session.
     */
    public function configureDocumentDungeon(LearningContent $content): array
    {
        $flowType = $this->selectFlow($content);
        $config   = self::FLOW_CONFIGS[$flowType] ?? self::FLOW_CONFIGS['document_dungeon'];

        $sections = $content->structured_sections ?? [];

        return array_merge($config, [
            'flow_type'      => $flowType,
            'total_sections' => count($sections),
            'content_title'  => $content->title,
            'content_type'   => $content->content_type,
            'difficulty'     => $content->difficulty ?? 'medium',
        ]);
    }

    /**
     * Get the config for any flow type.
     */
    public function getFlowConfig(string $flowType): array
    {
        return self::FLOW_CONFIGS[$flowType] ?? self::FLOW_CONFIGS['document_dungeon'];
    }
}
