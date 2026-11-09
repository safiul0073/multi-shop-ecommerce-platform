<?php

namespace App\Http\Controllers\Api\Storefront;

use App\Enums\ShopProductStatus;
use App\Enums\ShopStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\StorefrontProductResource;
use App\Http\Resources\StorefrontShopResource;
use App\Models\Shop;
use App\Models\ShopProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StorefrontController extends Controller
{
    public function shop(string $shopSlug): JsonResponse
    {
        $shop = Shop::where('slug', $shopSlug)
            ->where('status', ShopStatus::ACTIVE)
            ->first();

        if (! $shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found or currently inactive.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new StorefrontShopResource($shop),
        ]);
    }

    public function products(string $shopSlug, Request $request): JsonResponse
    {
        $shop = Shop::where('slug', $shopSlug)
            ->where('status', ShopStatus::ACTIVE)
            ->first();

        if (! $shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found or currently inactive.',
            ], 404);
        }

        $query = ShopProduct::query()
            ->where('shop_id', $shop->id)
            ->where('status', ShopProductStatus::ACTIVE)
            ->with('product');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 12);
        $listings = $query->latest('updated_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => StorefrontProductResource::collection($listings),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    public function product(string $shopSlug, string $productSlug): JsonResponse
    {
        $shop = Shop::where('slug', $shopSlug)
            ->where('status', ShopStatus::ACTIVE)
            ->first();

        if (! $shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found.',
            ], 404);
        }

        $listing = ShopProduct::query()
            ->where('shop_id', $shop->id)
            ->where('status', ShopProductStatus::ACTIVE)
            ->whereHas('product', function ($q) use ($productSlug) {
                $q->where('slug', $productSlug);
            })
            ->with('product')
            ->first();

        if (! $listing) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found in this shop.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new StorefrontProductResource($listing),
        ]);
    }
}
