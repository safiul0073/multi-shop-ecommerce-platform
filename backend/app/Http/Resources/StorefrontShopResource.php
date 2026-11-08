<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorefrontShopResource extends JsonResource
{
    /**
     * Transform the storefront shop profile into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo ?: asset('images/shop-placeholder.svg'),
            'banner' => $this->banner,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'address' => $this->address,
            'status' => $this->status?->value ?? (string) $this->status,
        ];
    }
}
