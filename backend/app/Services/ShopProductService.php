<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ShopProductService
{
    public function __construct(
        protected ProductService $productService,
        protected ImageUploadService $imageUploadService
    ) {}

    /**
     * List listings assigned to a specific shop.
     */
    public function listShopProducts(Shop $shop, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = ShopProduct::query()
            ->where('shop_id', $shop->id)
            ->with(['product.creator']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        return $query->latest('updated_at')->paginate($perPage);
    }

    /**
     * Add an existing global product to a shop.
     */
    public function addExistingProductToShop(Shop $shop, int $productId, array $listingData): ShopProduct
    {
        // Prevent duplicate listing in the same shop
        $exists = ShopProduct::where('shop_id', $shop->id)
            ->where('product_id', $productId)
            ->exists();

        if ($exists) {
            throw new InvalidArgumentException('This product is already listed in your shop.');
        }

        // Verify product exists
        $product = Product::findOrFail($productId);

        return ShopProduct::create([
            'shop_id' => $shop->id,
            'product_id' => $product->id,
            'price' => $listingData['price'],
            'description' => $listingData['description'] ?? null,
            'thumbnail' => $listingData['thumbnail'] ?? null,
            'status' => $listingData['status'] ?? 'active',
        ]);
    }

    /**
     * Create a new global product and automatically list it in the shop within a single transaction.
     */
    public function createNewProductAndListInShop(Shop $shop, array $productData, array $listingData, int $userId): ShopProduct
    {
        return DB::transaction(function () use ($shop, $productData, $listingData, $userId) {
            // 1. Create global product
            $product = $this->productService->createProduct($productData, $userId);

            // 2. Create listing in the owner's shop
            return ShopProduct::create([
                'shop_id' => $shop->id,
                'product_id' => $product->id,
                'price' => $listingData['price'],
                'description' => $listingData['description'] ?? null,
                'thumbnail' => $listingData['thumbnail'] ?? null,
                'status' => $listingData['status'] ?? 'active',
            ]);
        });
    }

    /**
     * Update shop listing details.
     */
    public function updateListing(ShopProduct $shopProduct, array $data): ShopProduct
    {
        $shopProduct->update([
            'price' => $data['price'] ?? $shopProduct->price,
            'description' => array_key_exists('description', $data) ? $data['description'] : $shopProduct->description,
            'thumbnail' => array_key_exists('thumbnail', $data) ? $data['thumbnail'] : $shopProduct->thumbnail,
            'status' => $data['status'] ?? $shopProduct->status,
        ]);

        return $shopProduct->fresh(['product.creator', 'shop']);
    }

    /**
     * Remove product listing from shop. Does NOT delete global product.
     */
    public function removeListing(ShopProduct $shopProduct): bool
    {
        return (bool) $shopProduct->delete();
    }
}
