<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ShopProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'created_by']);
        $perPage = (int) $request->input('per_page', 15);

        $products = $this->productService->listGlobalProducts($filters, $perPage);

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

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct(
            $request->validated(),
            $request->user()->id
        );
        $product->load('creator');

        return response()->json([
            'success' => true,
            'message' => 'Global product created successfully in shared catalog.',
            'data' => new ProductResource($product),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['creator', 'shopProducts.shop']);

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
            'shops_using' => ShopProductResource::collection($product->shopProducts),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $updated = $this->productService->updateProduct($product, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => new ProductResource($updated),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->deleteProduct($product);

        return response()->json([
            'success' => true,
            'message' => 'Product removed from catalog.',
        ]);
    }
}
