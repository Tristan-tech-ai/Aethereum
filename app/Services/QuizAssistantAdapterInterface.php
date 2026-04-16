<?php

namespace App\Services;

interface QuizAssistantAdapterInterface
{
    /**
     * Create a new quiz session with the given configuration.
     * @param array $config
     * @param int|string $userId
     * @return array Contains session details and URL
     */
    public function createSession(array $config, $userId): array;

    /**
     * Evaluate the submitted answers for a session.
     * @param string $sessionId
     * @param array $answers
     * @param int|string $userId
     * @return array Evaluation details
     */
    public function evaluateSession(string $sessionId, array $answers, $userId): array;

    /**
     * Pause an active quiz session.
     * @param string $sessionId
     * @param int|string $userId
     * @return bool
     */
    public function pauseSession(string $sessionId, $userId): bool;

    /**
     * Resume a paused quiz session.
     * @param string $sessionId
     * @param int|string $userId
     * @return array|null
     */
    public function resumeSession(string $sessionId, $userId): ?array;
}
