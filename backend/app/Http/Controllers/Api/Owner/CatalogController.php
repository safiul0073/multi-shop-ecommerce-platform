<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $shopId = $request->input('shop_id');
        if (! $shopId) {
            $shop = $user->shops()->first();
            $shopId = $shop?->id;
        } else {
            $isOwner = $user->shops()->where('id', $shopId)->exists();
            if (! $isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized shop specified.',
                ], 403);
            }
        }

        $filters = $request->only(['search']);
        $perPage = (int) $request->input('per_page', 12);

        $products = $this->productService->listGlobalProducts($filters, $perPage, $shopId);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $product->load('creator');

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }
}
