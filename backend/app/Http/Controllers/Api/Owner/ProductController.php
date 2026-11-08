<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreProductRequest;
use App\Http\Resources\ShopProductResource;
use App\Models\Shop;
use App\Services\ShopProductService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(
        protected ShopProductService $shopProductService
    ) {}

    public function store(StoreProductRequest $request): JsonResponse
    {
        $shop = Shop::findOrFail($request->input('shop_id'));

        $globalProductData = [
            'name' => $request->input('name'),
            'sku' => $request->input('sku'),
            'description' => $request->input('description'),
            'thumbnail' => $request->input('thumbnail'),
        ];

        $listingData = [
            'price' => $request->input('price'),
            'description' => $request->input('listing_description'),
            'thumbnail' => $request->input('listing_thumbnail'),
            'status' => $request->input('status', 'active'),
        ];

        $shopProduct = $this->shopProductService->createNewProductAndListInShop(
            $shop,
            $globalProductData,
            $listingData,
            $request->user()->id
        );

        $shopProduct->load(['product.creator', 'shop']);

        return response()->json([
            'success' => true,
            'message' => 'Product created in global catalog and added to your shop.',
            'data' => new ShopProductResource($shopProduct),
        ], 201);
    }
}
