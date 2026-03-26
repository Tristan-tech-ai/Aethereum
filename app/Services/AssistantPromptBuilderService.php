<?php

namespace App\Services;

use App\Models\User;

/**
 * Builds Gemini prompts for different Nexera Assistant modes.
 */
class AssistantPromptBuilderService
{
    private const SYSTEM_BASE = <<<'SYSTEM'
You are Nexera Assistant, an intelligent personal learning coach for the Nexera platform.

Your role:
1. Help users plan their study schedule and learning strategy
2. Coach users through their active learning sessions
3. Answer questions about learning materials they are studying
4. Reflect on their progress and suggest improvements
5. Keep interactions focused on education and self-development

Rules:
- Only answer based on the data context provided below. Do NOT fabricate facts about materials not shown.
- If you don't have enough data to answer, say so clearly and suggest what the user can do.
- Be encouraging but honest. Don't over-promise.
- Prefer Bahasa Indonesia if the user's message is in Indonesian; use English if they write in English.
- NEVER give harmful, medical, legal, or financial advice.
- If the question is unrelated to learning/education, gently redirect to learning topics.
SYSTEM;

    private const CHAT_JSON_SCHEMA = <<<'SCHEMA'

=== OUTPUT FORMAT (strict JSON, no markdown fences) ===
Return a JSON object with this structure:
{
  "message": "Your main response text in markdown format. Use **bold**, bullet points, headers etc. Keep it concise (2-4 short paragraphs max).",
  "sections": [
    {
      "type": "insight|tip|progress|warning|summary",
      "icon": "brain|target|chart|lightbulb|flame|book|star|alert|trophy|rocket",
      "title": "Short section title",
      "content": "Section content in markdown"
    }
  ],
  "cta": [
    {
      "label": "Button text (short, 2-5 words)",
      "action": "send_message|open_tab",
      "payload": "The message to send or tab to open (plan/reflect)"
    }
  ],
  "user_data": {
    "show": true or false,
    "metrics": [
      {
        "label": "Metric name",
        "value": "Metric value",
        "icon": "flame|star|book|chart|target|trophy|zap",
        "color": "primary|accent|success|warning|danger"
      }
    ]
  }
}

RULES for sections:
- Use 0-3 sections maximum. Only include if they add value.
- "insight" = data-driven observation about user's learning
- "tip" = actionable study tip
- "progress" = stats/progress highlight
- "warning" = something needs attention
- "summary" = brief summary of key points

RULES for cta:
- Include 1-3 relevant CTA buttons. At least one if possible.
- action "send_message" → payload is the follow-up message text
- action "open_tab" → payload is "plan" or "reflect"
- Make CTAs directly relevant to the conversation

RULES for user_data:
- Set show=true only when the response involves user stats/progress
- Include 2-4 relevant metrics maximum
- Only use data from the USER PROFILE context provided

Output ONLY valid JSON.
SCHEMA;

    /**
     * Build the full prompt for a general chat turn.
     */
    public function buildChatPrompt(
        string $userMessage,
        string $userContext,
        array $conversationHistory = []
    ): string {
        $historyText = $this->formatHistory($conversationHistory);

        return self::SYSTEM_BASE
            . self::CHAT_JSON_SCHEMA
            . "\n\n"
            . $userContext
            . ($historyText ? "\n\n=== CONVERSATION HISTORY ===\n{$historyText}" : '')
            . "\n\n=== USER MESSAGE ===\n{$userMessage}";
    }

    /**
     * Build prompt for in-session coaching (contextual help during a learning session).
     */
    public function buildSessionCoachPrompt(
        string $userMessage,
        string $userContext,
        string $sessionContext
    ): string {
        return self::SYSTEM_BASE
            . "\n\nYou are currently helping the user DURING an active learning session. "
            . "Focus your advice on the material they are studying right now."
            . self::CHAT_JSON_SCHEMA
            . "\n\n" . $userContext
            . "\n\n" . $sessionContext
            . "\n\n=== USER MESSAGE ===\n{$userMessage}";
    }

    /**
     * Build prompt for study plan generation. Returns structured JSON.
     */
    public function buildStudyPlanPrompt(
        User $user,
        string $goal,
        int $durationDays,
        int $dailyMinutes,
        string $userContext,
        string $contentList
    ): string {
        $today = now()->toDateString();

        return self::SYSTEM_BASE
            . "\n\nGenerate a personalised study plan as strict JSON."
            . "\n\nUSER GOAL: {$goal}"
            . "\nPLAN DURATION: {$durationDays} days (starting {$today})"
            . "\nDAILY TIME AVAILABLE: {$dailyMinutes} minutes per day"
            . "\n\n" . $userContext
            . "\n\n" . $contentList
            . <<<'JSON_RULES'


=== OUTPUT FORMAT (strict JSON — no markdown fences) ===
{
  "goal": "Refined goal statement",
  "duration_days": <integer>,
  "daily_minutes": <integer>,
  "weekly_plan": [
    {
      "day_label": "Day 1 — Monday",
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "Task title",
          "description": "Short description",
          "duration_min": <integer>,
          "type": "learning|review|quiz|social",
          "source_content_id": "<uuid or null>",
          "source_content_title": "<title or null>"
        }
      ]
    }
  ],
  "risk_alerts": ["alert1 if any"],
  "success_metric": "How to measure success",
  "motivational_message": "Short motivational note personalised to user"
}

RULES:
- Include tasks only for content that exists in the USER CONTENT LIBRARY above (use their IDs).
- If library is empty, still generate a plan with type "learning" tasks marked as source_content_id null, with advice to upload material first.
- Keep each day's total duration close to daily_minutes.
- Add review/quiz tasks after every 2-3 learning tasks.
- Output ONLY valid JSON, no markdown fences.
JSON_RULES;
    }

    /**
     * Build prompt for progress reflection.
     */
    public function buildReflectionPrompt(string $userContext): string
    {
        return self::SYSTEM_BASE
            . "\n\nThe user wants a progress reflection. Summarize their learning journey, "
            . "highlight strengths and weak areas, and give 2-3 actionable next steps."
            . "\n\n" . $userContext
            . "\n\n=== REFLECTION RESPONSE (markdown, structured with headings) ===";
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private function formatHistory(array $history): string
    {
        if (empty($history)) {
            return '';
        }

        return implode("\n", array_map(
            fn ($m) => strtoupper($m['role']) . ': ' . $m['content'],
            $history
        ));
    }
}
