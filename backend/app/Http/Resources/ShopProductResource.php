<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $globalProduct = $this->product;
        $fallbackThumbnail = $globalProduct?->thumbnail ?: asset('images/product-placeholder.svg');
        $effectiveThumbnail = $this->thumbnail ?: $fallbackThumbnail;
        $effectiveDescription = $this->description ?: ($globalProduct?->description ?? '');

        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'product_id' => $this->product_id,
            'price' => (float) $this->price,
            'price_formatted' => number_format((float) $this->price, 2),
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'effective_description' => $effectiveDescription,
            'effective_thumbnail' => $effectiveThumbnail,
            'status' => $this->status?->value ?? (string) $this->status,
            'product' => new ProductResource($this->whenLoaded('product')),
            'shop' => new ShopResource($this->whenLoaded('shop')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
