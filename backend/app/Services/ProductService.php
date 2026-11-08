<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * List shared catalog products with creator info, adoption counts, and optional shop-listing status.
     */
    public function listGlobalProducts(array $filters = [], int $perPage = 15, ?int $forShopId = null): LengthAwarePaginator
    {
        $query = Product::query()
            ->with('creator:id,name,email,role')
            ->withCount('shopProducts as adoption_count');

        if ($forShopId) {
            $query->withExists(['shopProducts as is_listed' => function ($q) use ($forShopId) {
                $q->where('shop_id', $forShopId);
            }]);
        }

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Create a global catalog product.
     */
    public function createProduct(array $data, int $userId): Product
    {
        $slug = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);
        $baseSlug = $slug;
        $count = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        $sku = !empty($data['sku']) ? strtoupper($data['sku']) : 'SKU-' . strtoupper(Str::random(8));

        return Product::create([
            'created_by' => $userId,
            'name' => $data['name'],
            'slug' => $slug,
            'sku' => $sku,
            'description' => $data['description'] ?? null,
            'thumbnail' => $data['thumbnail'] ?? null,
        ]);
    }

    /**
     * Update global product.
     */
    public function updateProduct(Product $product, array $data): Product
    {
        if (!empty($data['slug']) && $data['slug'] !== $product->slug) {
            $data['slug'] = Str::slug($data['slug']);
        }

        if (!empty($data['sku']) && $data['sku'] !== $product->sku) {
            $data['sku'] = strtoupper($data['sku']);
        }

        $product->update($data);

        return $product->fresh(['creator']);
    }

    /**
     * Delete a product.
     */
    public function deleteProduct(Product $product): bool
    {
        return (bool) $product->delete();
    }
}
