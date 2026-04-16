<?php

namespace App\Http\Requests\QuizAssistant;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\AssistantConversation;

class ChatMessageRequest extends FormRequest
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
            'message' => 'nullable|string|max:1000',
            'selected_option' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'conversation_id.required' => 'ID Percakapan wajib diisi.',
            'conversation_id.uuid' => 'Format ID Percakapan tidak valid.',
            'conversation_id.exists' => 'Percakapan tidak valid.',
            'message.max' => 'Pesan maksimal 1000 karakter.',
        ];
    }
}
