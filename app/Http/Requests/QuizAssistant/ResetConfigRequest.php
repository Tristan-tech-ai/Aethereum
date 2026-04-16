<?php

namespace App\Http\Requests\QuizAssistant;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\AssistantConversation;

class ResetConfigRequest extends FormRequest
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
            'conversation_id.required' => 'ID Percakapan wajib diisi.'
        ];
    }
}
