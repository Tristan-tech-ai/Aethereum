<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_profile_public'   => ['sometimes', 'boolean'],
            'show_on_leaderboard' => ['sometimes', 'boolean'],
            'weekly_goal'         => ['sometimes', 'integer', 'min:1', 'max:7'],
        ];
    }
}
