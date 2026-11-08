<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\AddShopProductRequest;
use App\Http\Requests\Owner\UpdateShopProductRequest;
use App\Http\Resources\ShopProductResource;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Services\ShopProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ShopProductController extends Controller
{
    public function __construct(
        protected ShopProductService $shopProductService
    ) {}

    public function index(Request $request, Shop $shop): JsonResponse
    {
        if ($shop->owner_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this shop.',
            ], 403);
        }

        $filters = $request->only(['search', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        $listings = $this->shopProductService->listShopProducts($shop, $filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ShopProductResource::collection($listings),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    public function store(AddShopProductRequest $request, Shop $shop): JsonResponse
    {
        try {
            $listing = $this->shopProductService->addExistingProductToShop(
                $shop,
                (int) $request->input('product_id'),
                $request->validated()
            );

            $listing->load(['product.creator', 'shop']);

            return response()->json([
                'success' => true,
                'message' => 'Product added to your shop successfully.',
                'data' => new ShopProductResource($listing),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function update(UpdateShopProductRequest $request, Shop $shop, ShopProduct $shopProduct): JsonResponse
    {
        // Enforce boundary check
        if ((int) $shopProduct->shop_id !== (int) $shop->id) {
            return response()->json([
                'success' => false,
                'message' => 'The product listing does not belong to the specified shop.',
            ], 404);
        }

        $updated = $this->shopProductService->updateListing($shopProduct, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Shop product listing updated successfully.',
            'data' => new ShopProductResource($updated),
        ]);
    }

    public function destroy(Request $request, Shop $shop, ShopProduct $shopProduct): JsonResponse
    {
        if ($shop->owner_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.',
            ], 403);
        }

        if ((int) $shopProduct->shop_id !== (int) $shop->id) {
            return response()->json([
                'success' => false,
                'message' => 'The product listing does not belong to the specified shop.',
            ], 404);
        }

        $this->shopProductService->removeListing($shopProduct);

        return response()->json([
            'success' => true,
            'message' => 'Product removed from your shop.',
        ]);
    }
}
