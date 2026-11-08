<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ShopStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ShopResource;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalShops = Shop::count();
        $activeShops = Shop::where('status', ShopStatus::ACTIVE)->count();
        $inactiveShops = Shop::where('status', ShopStatus::INACTIVE)->count();
        $totalProducts = Product::count();
        $totalShopOwners = User::where('role', UserRole::SHOP_OWNER)->count();
        $totalListings = ShopProduct::count();

        $recentShops = Shop::with('owner')->latest()->take(5)->get();
        $recentProducts = Product::with('creator')->latest()->take(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_shops' => $totalShops,
                    'active_shops' => $activeShops,
                    'inactive_shops' => $inactiveShops,
                    'total_products' => $totalProducts,
                    'total_shop_owners' => $totalShopOwners,
                    'total_listings' => $totalListings,
                ],
                'recent_shops' => ShopResource::collection($recentShops),
                'recent_products' => ProductResource::collection($recentProducts),
            ],
        ]);
    }
}
