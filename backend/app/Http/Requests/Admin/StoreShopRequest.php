<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:shops,slug'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:500'],
            'banner' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],

            // Owner selection: either an existing owner_id or a new_owner payload
            'owner_id' => ['required_without:new_owner', 'nullable', 'exists:users,id'],
            'new_owner' => ['required_without:owner_id', 'nullable', 'array'],
            'new_owner.name' => ['required_with:new_owner', 'string', 'max:255'],
            'new_owner.email' => ['required_with:new_owner', 'email', 'max:255', 'unique:users,email'],
            'new_owner.password' => ['required_with:new_owner', 'string', 'min:8'],
        ];
    }
}
