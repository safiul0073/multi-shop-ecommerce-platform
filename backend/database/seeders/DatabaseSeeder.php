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
    public function run(): void
    {
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
                'name' => 'Sara Rahman',
                'password' => Hash::make('password'),
                'role' => UserRole::SHOP_OWNER,
                'email_verified_at' => now(),
            ]
        );

        $owner2 = User::firstOrCreate(
            ['email' => 'owner2@example.com'],
            [
                'name' => 'Tanvir Ahmed',
                'password' => Hash::make('password'),
                'role' => UserRole::SHOP_OWNER,
                'email_verified_at' => now(),
            ]
        );

        $fashionHouse = Shop::firstOrCreate(
            ['slug' => 'fashion-house'],
            [
                'owner_id' => $owner1->id,
                'name' => 'Fashion House',
                'description' => 'Curated contemporary fashion, handcrafted leather and timeless everyday essentials.',
                'logo' => null,
                'banner' => asset('images/banners/fashion.jpg'),
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
                'description' => 'Premium audio, smart wearables and thoughtfully designed desk gear.',
                'logo' => null,
                'banner' => asset('images/banners/tech.jpg'),
                'contact_email' => 'support@techstore.io',
                'contact_phone' => '+880 1819 222333',
                'address' => 'Level 4, Multiplan Center, Elephant Road, Dhaka',
                'status' => ShopStatus::ACTIVE,
            ]
        );

        $catalog = [
            'FH-BAG-001' => [$admin, 'Everyday Canvas Backpack', 'everyday-canvas-backpack', 'backpack', 'Water-resistant navy canvas backpack with a padded 15" laptop sleeve, hidden back pocket and vegan leather trims.'],
            'TS-AUD-001' => [$admin, 'Studio Wireless Headphones', 'studio-wireless-headphones', 'headphones', 'Over-ear Bluetooth 5.3 headphones with active noise cancelling, 40 mm drivers and 40-hour battery life.'],
            'TS-AUD-002' => [$admin, 'Portable Bluetooth Speaker', 'portable-bluetooth-speaker', 'speaker', 'IP67 waterproof speaker with punchy 360° sound, 20-hour playtime and USB-C fast charging.'],
            'FH-APP-001' => [$owner1, 'Essential Cotton Crew Tee', 'essential-cotton-crew-tee', 'tshirt', '200 GSM combed cotton t-shirt with a relaxed fit and reinforced crew neck. Pre-shrunk.'],
            'FH-APP-002' => [$owner1, 'Classic Leather Biker Jacket', 'classic-leather-biker-jacket', 'jacket', 'Genuine lambskin leather jacket with asymmetric zip, quilted lining and three exterior pockets.'],
            'FH-SHO-001' => [$owner1, 'Flyknit Running Sneakers', 'flyknit-running-sneakers', 'sneakers', 'Lightweight breathable knit upper with responsive foam midsole for daily runs and all-day wear.'],
            'FH-ACC-001' => [$owner1, 'Polarized Wayfarer Sunglasses', 'polarized-wayfarer-sunglasses', 'sunglasses', 'Acetate frame with polarized UV400 lenses that cut glare. Includes hard case and cleaning cloth.'],
            'TS-WCH-001' => [$owner2, 'Minimal Smart Watch', 'minimal-smart-watch', 'watch', 'AMOLED always-on display, heart-rate and SpO2 tracking, 7-day battery and swappable silicone straps.'],
            'TS-KEY-001' => [$owner2, 'Slim Wireless Keyboard', 'slim-wireless-keyboard', 'keyboard', 'Low-profile scissor-switch keyboard that pairs with up to three devices. Rechargeable, 2-month battery.'],
            'TS-MOU-001' => [$owner2, 'Ergonomic Wireless Mouse', 'ergonomic-wireless-mouse', 'mouse', 'Silent-click contoured mouse with 4000 DPI sensor and 2.4 GHz receiver. Up to 12 months per battery.'],
            'TS-CAM-001' => [$owner2, 'Instant Film Camera', 'instant-film-camera', 'camera', 'Retro instant camera with auto exposure, built-in flash and selfie mirror. Prints credit-card sized photos.'],
            // In the catalog but not assigned to any shop: must stay hidden from customers.
            'TS-DSK-001' => [$admin, 'Oak Desk Setup Bundle', 'oak-desk-setup-bundle', 'deskmat', 'Solid oak desk shelf, felt desk mat and warm LED lamp. Catalog only: not listed in any shop yet.'],
        ];

        $products = [];
        foreach ($catalog as $sku => [$creator, $name, $slug, $image, $description]) {
            $products[$sku] = Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'created_by' => $creator->id,
                    'name' => $name,
                    'slug' => $slug,
                    'description' => $description,
                    'thumbnail' => asset("images/products/{$image}.jpg"),
                ]
            );
        }

        $listings = [
            [$fashionHouse, 'FH-APP-001', 1450, null, ShopProductStatus::ACTIVE],
            [$fashionHouse, 'FH-APP-002', 18900, null, ShopProductStatus::ACTIVE],
            [$fashionHouse, 'FH-SHO-001', 7200, null, ShopProductStatus::ACTIVE],
            [$fashionHouse, 'FH-ACC-001', 3500, null, ShopProductStatus::ACTIVE],
            [$fashionHouse, 'FH-BAG-001', 4200, null, ShopProductStatus::ACTIVE],
            [$fashionHouse, 'TS-WCH-001', 12500, 'Fashion House edition: ships with a premium leather strap and travel pouch.', ShopProductStatus::ACTIVE],
            [$fashionHouse, 'TS-AUD-001', 9800, null, ShopProductStatus::INACTIVE], // hidden from storefront
            [$techStore, 'TS-WCH-001', 10990, 'Tech Store bundle: includes a magnetic fast-charging dock and screen protector.', ShopProductStatus::ACTIVE],
            [$techStore, 'TS-AUD-001', 8900, 'Includes braided 3.5 mm cable and 2-year official warranty.', ShopProductStatus::ACTIVE],
            [$techStore, 'TS-AUD-002', 4500, null, ShopProductStatus::ACTIVE],
            [$techStore, 'TS-KEY-001', 5200, null, ShopProductStatus::ACTIVE],
            [$techStore, 'TS-MOU-001', 2400, null, ShopProductStatus::ACTIVE],
            [$techStore, 'TS-CAM-001', 9500, null, ShopProductStatus::ACTIVE],
            [$techStore, 'FH-BAG-001', 4600, 'Tech Store pick: fits laptops up to 15" with room for chargers and cables.', ShopProductStatus::ACTIVE],
        ];

        foreach ($listings as [$shop, $sku, $price, $description, $status]) {
            ShopProduct::updateOrCreate(
                ['shop_id' => $shop->id, 'product_id' => $products[$sku]->id],
                [
                    'price' => $price,
                    'description' => $description,
                    'thumbnail' => null,
                    'status' => $status,
                ]
            );
        }
    }
}
