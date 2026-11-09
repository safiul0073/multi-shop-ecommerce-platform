<?php

use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ShopController as AdminShopController;
use App\Http\Controllers\Api\Admin\ShopOwnerController as AdminShopOwnerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Owner\CatalogController as OwnerCatalogController;
use App\Http\Controllers\Api\Owner\DashboardController as OwnerDashboardController;
use App\Http\Controllers\Api\Owner\ProductController as OwnerProductController;
use App\Http\Controllers\Api\Owner\ShopController as OwnerShopController;
use App\Http\Controllers\Api\Owner\ShopProductController as OwnerShopProductController;
use App\Http\Controllers\Api\Storefront\StorefrontController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::middleware('auth:sanctum')->post('/upload', [UploadController::class, 'upload']);

    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::apiResource('shops', AdminShopController::class);

        Route::apiResource('products', AdminProductController::class);

        Route::apiResource('shop-owners', AdminShopOwnerController::class)
            ->except('destroy')
            ->parameters(['shop-owners' => 'user']);
        Route::post('/shop-owners/{user}/reset-password', [AdminShopOwnerController::class, 'resetPassword']);
    });

    Route::middleware(['auth:sanctum', 'role:shop_owner'])->prefix('owner')->group(function () {
        Route::get('/dashboard', [OwnerDashboardController::class, 'index']);

        Route::apiResource('shops', OwnerShopController::class)->only(['index', 'show', 'update']);

        Route::apiResource('catalog', OwnerCatalogController::class)
            ->only(['index', 'show'])
            ->parameters(['catalog' => 'product']);

        Route::apiResource('products', OwnerProductController::class)->only('store');

        Route::apiResource('shops.products', OwnerShopProductController::class)
            ->except('show')
            ->parameters(['products' => 'shopProduct']);
    });

    Route::prefix('storefront')->group(function () {
        Route::get('/{shopSlug}', [StorefrontController::class, 'shop']);
        Route::get('/{shopSlug}/products', [StorefrontController::class, 'products']);
        Route::get('/{shopSlug}/products/{productSlug}', [StorefrontController::class, 'product']);
    });
});
