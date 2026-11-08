<?php

namespace App\Http\Requests\Owner;

use App\Models\Shop;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user || !$user->isShopOwner()) {
            return false;
        }

        $shopId = $this->input('shop_id');
        if (!$shopId) {
            return false;
        }

        // Verify authenticated owner owns this shop
        return Shop::where('id', $shopId)->where('owner_id', $user->id)->exists();
    }

    public function rules(): array
    {
        return [
            'shop_id' => ['required', 'exists:shops,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'listing_description' => ['nullable', 'string'],
            'listing_thumbnail' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
