<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorefrontProductResource extends JsonResource
{
    /**
     * Transform the storefront product resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $global = $this->product;
        $fallbackThumbnail = $global?->thumbnail ?: asset('images/product-placeholder.svg');
        $effectiveThumbnail = $this->thumbnail ?: $fallbackThumbnail;
        $effectiveDescription = $this->description ?: ($global?->description ?? '');

        return [
            'id' => $this->id, // listing id
            'product_id' => $this->product_id,
            'name' => $global?->name,
            'slug' => $global?->slug,
            'sku' => $global?->sku,
            'price' => (float) $this->price,
            'price_formatted' => number_format((float) $this->price, 2),
            'currency_symbol' => '৳',
            'description' => $effectiveDescription,
            'thumbnail' => $effectiveThumbnail,
            'status' => $this->status?->value ?? (string) $this->status,
        ];
    }
}
