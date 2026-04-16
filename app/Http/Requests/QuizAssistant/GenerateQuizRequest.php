<?php

namespace App\Http\Requests\QuizAssistant;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\AssistantConversation;

class GenerateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        $conversation = AssistantConversation::find($this->conversation_id);
        return $conversation && $conversation->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'conversation_id' => 'required|uuid|exists:assistant_conversations,id',
        ];
    }

    public function messages(): array
    {
        return [
            'conversation_id.required' => 'ID Percakapan wajib diisi.',
            'conversation_id.uuid' => 'Format ID Percakapan tidak valid.',
            'conversation_id.exists' => 'Percakapan tidak ditemukan.'
        ];
    }
}
