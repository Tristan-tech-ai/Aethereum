<?php

namespace App\Exceptions\QuizAssistant;

use Exception;

class InvalidConversationStateException extends Exception
{
    public array $contextData;

    public function __construct(string $message = "Percakapan berada di tahap yang tidak sesuai.", array $contextData = [], \Throwable $previous = null)
    {
        parent::__construct($message, 409, $previous);
        $this->contextData = $contextData;
    }
}
