<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShopRequest;
use App\Http\Requests\Admin\UpdateShopRequest;
use App\Http\Resources\ShopProductResource;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use App\Services\ShopService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function __construct(
        protected ShopService $shopService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'owner_id']);
        $perPage = (int) $request->input('per_page', 15);

        $shops = $this->shopService->listShops($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ShopResource::collection($shops),
            'meta' => [
                'current_page' => $shops->currentPage(),
                'last_page' => $shops->lastPage(),
                'per_page' => $shops->perPage(),
                'total' => $shops->total(),
            ],
        ]);
    }

    public function store(StoreShopRequest $request): JsonResponse
    {
        $shopData = $request->safe()->except(['new_owner']);
        $newOwnerData = $request->input('new_owner');

        $shop = $this->shopService->createShopWithOptionalOwner($shopData, $newOwnerData);
        $shop->load('owner');

        return response()->json([
            'success' => true,
            'message' => 'Shop created successfully.',
            'data' => new ShopResource($shop),
        ], 201);
    }

    public function show(Shop $shop): JsonResponse
    {
        $shop->load(['owner', 'shopProducts.product']);

        return response()->json([
            'success' => true,
            'data' => new ShopResource($shop),
            'products' => ShopProductResource::collection($shop->shopProducts),
        ]);
    }

    public function update(UpdateShopRequest $request, Shop $shop): JsonResponse
    {
        $updated = $this->shopService->updateShop($shop, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Shop updated successfully.',
            'data' => new ShopResource($updated),
        ]);
    }

    public function destroy(Shop $shop): JsonResponse
    {
        $this->shopService->deleteShop($shop);

        return response()->json([
            'success' => true,
            'message' => 'Shop deleted successfully.',
        ]);
    }
}
