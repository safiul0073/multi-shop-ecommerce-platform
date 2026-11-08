<?php

namespace App\Http\Requests\Owner;

use App\Models\Shop;
use Illuminate\Foundation\Http\FormRequest;

class AddShopProductRequest extends FormRequest
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
            'product_id' => ['required', 'exists:products,id'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
