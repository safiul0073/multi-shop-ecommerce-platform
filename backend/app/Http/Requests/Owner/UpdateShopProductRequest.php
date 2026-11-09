<?php

namespace App\Http\Requests\Owner;

use App\Models\Shop;
use App\Models\ShopProduct;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShopProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user || !$user->isShopOwner()) {
            return false;
        }

        $shop = $this->route('shop');
        $shopId = $shop instanceof Shop ? $shop->id : $shop;

        if (!Shop::where('id', $shopId)->where('owner_id', $user->id)->exists()) {
            return false;
        }

        $shopProduct = $this->route('shopProduct');
        if ($shopProduct instanceof ShopProduct) {
            return (int) $shopProduct->shop_id === (int) $shopId;
        }

        return ShopProduct::where('id', $shopProduct)->where('shop_id', $shopId)->exists();
    }

    public function rules(): array
    {
        return [
            'price' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
        ];
    }
}
