<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\UpdateShopRequest;
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
        $shops = $request->user()->shops()->withCount('shopProducts')->get();

        return response()->json([
            'success' => true,
            'data' => ShopResource::collection($shops),
        ]);
    }

    public function show(Request $request, Shop $shop): JsonResponse
    {
        if ($shop->owner_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this shop.',
            ], 403);
        }

        $shop->loadCount('shopProducts');

        return response()->json([
            'success' => true,
            'data' => new ShopResource($shop),
        ]);
    }

    public function update(UpdateShopRequest $request, Shop $shop): JsonResponse
    {
        $updated = $this->shopService->updateShop($shop, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Shop settings updated successfully.',
            'data' => new ShopResource($updated),
        ]);
    }
}
