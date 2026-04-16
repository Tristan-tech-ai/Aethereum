<?php

namespace App\Exceptions\QuizAssistant;

use Exception;

class QuizGenerationException extends Exception
{
    public array $contextData;

    public function __construct(string $message = "Gagal membuat soal. Coba kurangi jumlah soal atau pilih section yang berbeda.", array $contextData = [], \Throwable $previous = null)
    {
        parent::__construct($message, 422, $previous);
        $this->contextData = $contextData;
    }
}
