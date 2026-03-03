<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name'     => ['sometimes', 'string', 'max:255'],
            'username' => [
                'sometimes', 'string', 'max:50', 'alpha_dash',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'bio'      => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
