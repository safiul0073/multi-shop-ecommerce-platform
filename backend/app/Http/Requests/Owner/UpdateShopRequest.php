<?php

namespace App\Http\Requests\Owner;

use App\Models\Shop;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user || !$user->isShopOwner()) {
            return false;
        }

        $shop = $this->route('shop');
        if ($shop instanceof Shop) {
            return $shop->owner_id === $user->id;
        }

        return Shop::where('id', $shop)->where('owner_id', $user->id)->exists();
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:500'],
            'banner' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
        ];
    }
}
