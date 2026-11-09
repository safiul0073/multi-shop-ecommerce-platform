<?php

namespace App\Http\Controllers\Api\Owner;

use App\Enums\ShopProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ShopProductResource;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use App\Models\ShopProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $shopId = $request->input('shop_id');
        $shop = $shopId
            ? $user->shops()->where('id', $shopId)->first()
            : $user->shops()->first();

        if (! $shop) {
            return response()->json([
                'success' => true,
                'data' => [
                    'shop' => null,
                    'metrics' => [
                        'total_products' => 0,
                        'active_listings' => 0,
                        'inactive_listings' => 0,
                    ],
                    'recent_products' => [],
                ],
            ]);
        }

        $totalProducts = ShopProduct::where('shop_id', $shop->id)->count();
        $activeListings = ShopProduct::where('shop_id', $shop->id)->where('status', ShopProductStatus::ACTIVE)->count();
        $inactiveListings = ShopProduct::where('shop_id', $shop->id)->where('status', ShopProductStatus::INACTIVE)->count();

        $recentListings = ShopProduct::where('shop_id', $shop->id)
            ->with(['product.creator'])
            ->latest('created_at')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'shop' => new ShopResource($shop),
                'metrics' => [
                    'total_products' => $totalProducts,
                    'active_listings' => $activeListings,
                    'inactive_listings' => $inactiveListings,
                ],
                'recent_products' => ShopProductResource::collection($recentListings),
            ],
        ]);
    }
}
