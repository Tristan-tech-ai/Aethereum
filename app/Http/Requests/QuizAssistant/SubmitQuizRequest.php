<?php

namespace App\Http\Requests\QuizAssistant;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\AssistantConversation;

class SubmitQuizRequest extends FormRequest
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
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer' => 'required|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'conversation_id.required' => 'ID Percakapan wajib diisi.',
            'answers.required' => 'Jawaban wajib diisi.',
            'answers.array' => 'Format jawaban tidak valid.',
            'answers.min' => 'Setidaknya ada satu jawaban.',
            'answers.*.question_id.required' => 'ID Pertanyaan wajib ada.',
            'answers.*.answer.required' => 'Jawaban untuk pertanyaan wajib diisi.'
        ];
    }
}
