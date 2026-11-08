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

/*
|--------------------------------------------------------------------------
| API Routes - Multi-Shop E-Commerce Management System (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ----------------------------------------------------------------------
    // Authentication (Rate-limited)
    // ----------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // ----------------------------------------------------------------------
    // File Uploads
    // ----------------------------------------------------------------------
    Route::middleware('auth:sanctum')->post('/upload', [UploadController::class, 'upload']);

    // ----------------------------------------------------------------------
    // Administrator Protected Routes
    // ----------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Shop Management
        Route::apiResource('shops', AdminShopController::class);

        // Global Shared Catalog Management
        Route::apiResource('products', AdminProductController::class);

        // Shop Owner Management
        Route::get('/shop-owners', [AdminShopOwnerController::class, 'index']);
        Route::post('/shop-owners', [AdminShopOwnerController::class, 'store']);
        Route::get('/shop-owners/{user}', [AdminShopOwnerController::class, 'show']);
        Route::put('/shop-owners/{user}', [AdminShopOwnerController::class, 'update']);
        Route::post('/shop-owners/{user}/reset-password', [AdminShopOwnerController::class, 'resetPassword']);
    });

    // ----------------------------------------------------------------------
    // Shop Owner Protected Routes
    // ----------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:shop_owner'])->prefix('owner')->group(function () {
        Route::get('/dashboard', [OwnerDashboardController::class, 'index']);

        // Owner's shops
        Route::get('/shops', [OwnerShopController::class, 'index']);
        Route::get('/shops/{shop}', [OwnerShopController::class, 'show']);
        Route::put('/shops/{shop}', [OwnerShopController::class, 'update']);

        // Browse Global Catalog
        Route::get('/catalog', [OwnerCatalogController::class, 'index']);
        Route::get('/catalog/{product}', [OwnerCatalogController::class, 'show']);

        // Create global product & auto-list in shop
        Route::post('/products', [OwnerProductController::class, 'store']);

        // Shop product listing management
        Route::get('/shops/{shop}/products', [OwnerShopProductController::class, 'index']);
        Route::post('/shops/{shop}/products', [OwnerShopProductController::class, 'store']);
        Route::put('/shops/{shop}/products/{shopProduct}', [OwnerShopProductController::class, 'update']);
        Route::delete('/shops/{shop}/products/{shopProduct}', [OwnerShopProductController::class, 'destroy']);
    });

    // ----------------------------------------------------------------------
    // Public Storefront (No Auth Required)
    // ----------------------------------------------------------------------
    Route::prefix('storefront')->group(function () {
        Route::get('/{shopSlug}', [StorefrontController::class, 'shop']);
        Route::get('/{shopSlug}/products', [StorefrontController::class, 'products']);
        Route::get('/{shopSlug}/products/{productSlug}', [StorefrontController::class, 'product']);
    });
});
