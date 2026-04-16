<?php

namespace App\Exceptions\QuizAssistant;

use Exception;

class MaterialNotFoundException extends Exception
{
    public array $contextData;

    public function __construct(string $message = "Materi tidak ditemukan atau tidak dapat diakses.", array $contextData = [], \Throwable $previous = null)
    {
        parent::__construct($message, 404, $previous);
        $this->contextData = $contextData;
    }
}
