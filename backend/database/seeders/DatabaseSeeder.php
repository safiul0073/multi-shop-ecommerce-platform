<?php

namespace Database\Seeders;

use App\Enums\ShopProductStatus;
use App\Enums\ShopStatus;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // -------------------------------------------------------------
        // 1. Users: Administrator and Shop Owners
        // -------------------------------------------------------------
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        $owner1 = User::firstOrCreate(
            ['email' => 'owner1@example.com'],
            [
                'name' => 'Sara Rahman (Fashion Owner)',
                'password' => Hash::make('password'),
                'role' => UserRole::SHOP_OWNER,
                'email_verified_at' => now(),
            ]
        );

        $owner2 = User::firstOrCreate(
            ['email' => 'owner2@example.com'],
            [
                'name' => 'Tanvir Ahmed (Tech Owner)',
                'password' => Hash::make('password'),
                'role' => UserRole::SHOP_OWNER,
                'email_verified_at' => now(),
            ]
        );

        // -------------------------------------------------------------
        // 2. Shops
        // -------------------------------------------------------------
        $fashionHouse = Shop::firstOrCreate(
            ['slug' => 'fashion-house'],
            [
                'owner_id' => $owner1->id,
                'name' => 'Fashion House',
                'description' => 'Curated contemporary fashion, premium denim, handcrafted leather, and timeless everyday essentials.',
                'logo' => asset('images/shop-placeholder.svg'),
                'banner' => null,
                'contact_email' => 'contact@fashionhouse.com',
                'contact_phone' => '+880 1711 000111',
                'address' => 'House 42, Road 11, Banani, Dhaka',
                'status' => ShopStatus::ACTIVE,
            ]
        );

        $techStore = Shop::firstOrCreate(
            ['slug' => 'tech-store'],
            [
                'owner_id' => $owner2->id,
                'name' => 'Tech Store',
                'description' => 'Next-generation electronics, ergonomic computing setups, smart lifestyle accessories, and premium audio gear.',
                'logo' => asset('images/shop-placeholder.svg'),
                'banner' => null,
                'contact_email' => 'support@techstore.io',
                'contact_phone' => '+880 1819 222333',
                'address' => 'Level 4, Multiplan Center, Elephant Road, Dhaka',
                'status' => ShopStatus::ACTIVE,
            ]
        );

        // -------------------------------------------------------------
        // 3. Centralized Shared Product Catalog
        // -------------------------------------------------------------

        // Products created by Administrator
        $leatherBackpack = Product::firstOrCreate(
            ['sku' => 'SKU-LTH-BP01'],
            [
                'created_by' => $admin->id,
                'name' => 'Minimalist Leather Backpack',
                'slug' => 'minimalist-leather-backpack',
                'description' => 'Full-grain vintage brown leather backpack with padded 15-inch laptop sleeve and water-resistant lining.',
                'thumbnail' => asset('images/product-placeholder.svg'),
            ]
        );

        $wirelessHeadphones = Product::firstOrCreate(
            ['sku' => 'SKU-AUD-ANC9'],
            [
                'created_by' => $admin->id,
                'name' => 'Acoustic Pro Active Noise Cancelling Headphones',
                'slug' => 'acoustic-pro-anc-headphones',
                'description' => 'Hi-Res certified wireless headphones featuring 40mm beryllium drivers, 45-hour battery life, and spatial audio.',
                'thumbnail' => asset('images/product-placeholder.svg'),
            ]
        );

        // Products created by Shop Owner 1 (Sara - Fashion House)
        $organicTee = Product::firstOrCreate(
            ['sku' => 'SKU-APP-TEE01'],
            [
                'created_by' => $owner1->id,
                'name' => 'Heavyweight Organic Cotton T-Shirt',
                'slug' => 'heavyweight-organic-cotton-tshirt',
                'description' => '240 GSM pre-shrunk combed organic cotton t-shirt with reinforced crew neck collar and relaxed tailored fit.',
                'thumbnail' => asset('images/product-placeholder.svg'),
            ]
        );

        $smartWatch = Product::firstOrCreate(
            ['sku' => 'SKU-WCH-SMT02'],
            [
                'created_by' => $owner1->id,
                'name' => 'Titanium Smart Lifestyle Watch',
                'slug' => 'titanium-smart-lifestyle-watch',
                'description' => 'Ultra-thin Grade-5 titanium case with AMOLED always-on display, ECG heart monitoring, and interchangeable straps.',
                'thumbnail' => asset('images/product-placeholder.svg'),
            ]
        );

        // Products created by Shop Owner 2 (Tanvir - Tech Store)
        $mechanicalKeyboard = Product::firstOrCreate(
            ['sku' => 'SKU-KEY-RGB75'],
            [
                'created_by' => $owner2->id,
                'name' => 'Tactile Mechanical Keyboard 75%',
                'slug' => 'tactile-mechanical-keyboard-75',
                'description' => 'Custom hot-swappable mechanical keyboard with lubricated tactile switches, RGB per-key backlighting, and gasket mount.',
                'thumbnail' => asset('images/product-placeholder.svg'),
            ]
        );

        // Product in Shared Catalog UNASSIGNED to any shop (for testing storefront visibility)
        $unassignedProduct = Product::firstOrCreate(
            ['sku' => 'SKU-CAT-SOLO01'],
            [
                'created_by' => $admin->id,
                'name' => 'Universal Studio Desk Mat (Catalog Only)',
                'slug' => 'universal-studio-desk-mat',
                'description' => 'Extra-wide anti-fray micro-textured felt desk mat. Unlisted in any storefront to verify strict customer catalog isolation.',
                'thumbnail' => asset('images/product-placeholder.svg'),
            ]
        );

        // -------------------------------------------------------------
        // 4. Shop Listings (shop_products)
        // -------------------------------------------------------------

        // Requirement: "Ensure that at least one product is assigned to both shops with different:
        // - Selling prices
        // - Descriptions
        // - Thumbnails"
        // Let's use the Titanium Smart Lifestyle Watch ($smartWatch):
        // Fashion House lists it as a luxury fashion accessory:
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $fashionHouse->id,
                'product_id' => $smartWatch->id,
            ],
            [
                'price' => 12500.00,
                'description' => 'Fashion House Edition: Includes complimentary genuine Italian calfskin leather strap and luxury magnetic travel pouch.',
                'thumbnail' => asset('images/product-placeholder.svg'),
                'status' => ShopProductStatus::ACTIVE,
            ]
        );

        // Tech Store lists it as high-tech wearable gear at a different price:
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $techStore->id,
                'product_id' => $smartWatch->id,
            ],
            [
                'price' => 10990.00,
                'description' => 'Tech Store Performance Edition: Bundled with dual fast wireless charging dock and military-grade screen protector.',
                'thumbnail' => asset('images/product-placeholder.svg'),
                'status' => ShopProductStatus::ACTIVE,
            ]
        );

        // Another cross-listed item: Acoustic Pro ANC Headphones
        // Fashion House lists it at ৳18,500
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $fashionHouse->id,
                'product_id' => $wirelessHeadphones->id,
            ],
            [
                'price' => 18500.00,
                'description' => null, // Test fallback to global product description!
                'thumbnail' => null,   // Test fallback to global product thumbnail!
                'status' => ShopProductStatus::ACTIVE,
            ]
        );

        // Tech Store lists it at ৳16,900
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $techStore->id,
                'product_id' => $wirelessHeadphones->id,
            ],
            [
                'price' => 16900.00,
                'description' => 'Audiophile choice: Includes braided oxygen-free copper 3.5mm cable and 2-year express warranty.',
                'thumbnail' => null,
                'status' => ShopProductStatus::ACTIVE,
            ]
        );

        // Fashion House specific listing: Organic Tee
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $fashionHouse->id,
                'product_id' => $organicTee->id,
            ],
            [
                'price' => 1450.00,
                'description' => 'Everyday luxury in heavyweight combed organic cotton. Washed for extraordinary softness.',
                'thumbnail' => null,
                'status' => ShopProductStatus::ACTIVE,
            ]
        );

        // Tech Store specific listing: Mechanical Keyboard
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $techStore->id,
                'product_id' => $mechanicalKeyboard->id,
            ],
            [
                'price' => 8200.00,
                'description' => 'Factory-lubricated linear switches for smooth, quiet actuation during long coding and typing sessions.',
                'thumbnail' => null,
                'status' => ShopProductStatus::ACTIVE,
            ]
        );

        // Leather Backpack assigned to Fashion House as Inactive to verify customer storefront filters out inactive listings!
        ShopProduct::updateOrCreate(
            [
                'shop_id' => $fashionHouse->id,
                'product_id' => $leatherBackpack->id,
            ],
            [
                'price' => 7500.00,
                'description' => 'Upcoming Autumn collection - preview item.',
                'thumbnail' => null,
                'status' => ShopProductStatus::INACTIVE, // INACTIVE: Must not show up on /store/fashion-house!
            ]
        );
    }
}
