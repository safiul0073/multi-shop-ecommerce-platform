<?php

namespace Tests\Feature;

use App\Enums\ShopProductStatus;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerStorefrontTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner1;
    protected User $owner2;
    protected Shop $shop1;
    protected Shop $shop2;
    protected Product $productAssignedOnlyToShop1;
    protected Product $productAssignedOnlyToShop2;
    protected Product $productAssignedToBoth;
    protected Product $unassignedCatalogProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner1 = User::create([
            'name' => 'Sara Rahman',
            'email' => 'sara@fashionhouse.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $this->owner2 = User::create([
            'name' => 'Tanvir Ahmed',
            'email' => 'tanvir@techstore.io',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $this->shop1 = Shop::create([
            'owner_id' => $this->owner1->id,
            'name' => 'Fashion House',
            'slug' => 'fashion-house',
            'status' => 'active',
        ]);

        $this->shop2 = Shop::create([
            'owner_id' => $this->owner2->id,
            'name' => 'Tech Store',
            'slug' => 'tech-store',
            'status' => 'active',
        ]);

        // 1. Product assigned ONLY to Fashion House
        $this->productAssignedOnlyToShop1 = Product::create([
            'created_by' => $this->owner1->id,
            'name' => 'Silk Scarf',
            'slug' => 'silk-scarf',
            'sku' => 'SKU-FSH-01',
            'description' => '100% pure silk scarf',
            'thumbnail' => 'https://example.com/global-silk.jpg',
        ]);
        ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $this->productAssignedOnlyToShop1->id,
            'price' => 2500.00,
            'status' => ShopProductStatus::ACTIVE,
        ]);

        // 2. Product assigned ONLY to Tech Store
        $this->productAssignedOnlyToShop2 = Product::create([
            'created_by' => $this->owner2->id,
            'name' => 'Mechanical Numpad',
            'slug' => 'mechanical-numpad',
            'sku' => 'SKU-TEC-01',
            'description' => 'Dedicated numpad with blue switches',
            'thumbnail' => 'https://example.com/global-numpad.jpg',
        ]);
        ShopProduct::create([
            'shop_id' => $this->shop2->id,
            'product_id' => $this->productAssignedOnlyToShop2->id,
            'price' => 3200.00,
            'status' => ShopProductStatus::ACTIVE,
        ]);

        // 3. Product assigned to BOTH shops with different prices & custom descriptions
        $this->productAssignedToBoth = Product::create([
            'created_by' => $this->owner1->id,
            'name' => 'Smart Watch',
            'slug' => 'smart-watch',
            'sku' => 'SKU-WCH-01',
            'description' => 'Global smartwatch description',
            'thumbnail' => 'https://example.com/global-watch.jpg',
        ]);

        // Fashion House lists at ৳12,000 with custom description
        ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $this->productAssignedToBoth->id,
            'price' => 12000.00,
            'description' => 'Fashion House special luxury edition watch',
            'thumbnail' => 'https://example.com/fashion-watch.jpg',
            'status' => ShopProductStatus::ACTIVE,
        ]);

        // Tech Store lists at ৳10,500 with NULL description and thumbnail to test fallback!
        ShopProduct::create([
            'shop_id' => $this->shop2->id,
            'product_id' => $this->productAssignedToBoth->id,
            'price' => 10500.00,
            'description' => null, // tests fallback
            'thumbnail' => null,   // tests fallback
            'status' => ShopProductStatus::ACTIVE,
        ]);

        // 4. Product unassigned to ANY shop (exists only in catalog)
        $this->unassignedCatalogProduct = Product::create([
            'created_by' => $this->owner1->id,
            'name' => 'Catalog Only Desk Mat',
            'slug' => 'catalog-only-desk-mat',
            'sku' => 'SKU-SOLO-99',
            'description' => 'Must never appear on any storefront',
        ]);

        // 5. Product assigned to Fashion House but INACTIVE
        $inactiveProduct = Product::create([
            'created_by' => $this->owner1->id,
            'name' => 'Inactive Vintage Jacket',
            'slug' => 'inactive-vintage-jacket',
            'sku' => 'SKU-INACT-01',
        ]);
        ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $inactiveProduct->id,
            'price' => 5000.00,
            'status' => ShopProductStatus::INACTIVE,
        ]);
    }

    public function test_customer_storefront_only_shows_products_assigned_to_that_shop(): void
    {
        $response = $this->getJson('/api/v1/storefront/fashion-house/products');

        $response->assertStatus(200);
        $skus = collect($response->json('data'))->pluck('sku')->all();

        // Must contain Fashion House items
        $this->assertContains('SKU-FSH-01', $skus);
        $this->assertContains('SKU-WCH-01', $skus);

        // MUST NOT contain Tech Store exclusive item!
        $this->assertNotContains('SKU-TEC-01', $skus);

        // MUST NOT contain unassigned catalog item!
        $this->assertNotContains('SKU-SOLO-99', $skus);

        // MUST NOT contain inactive item!
        $this->assertNotContains('SKU-INACT-01', $skus);
    }

    public function test_customer_sees_shop_specific_selling_price_and_custom_description(): void
    {
        // Check Fashion House storefront for Smart Watch
        $response1 = $this->getJson('/api/v1/storefront/fashion-house/products/smart-watch');
        $response1->assertStatus(200);
        $this->assertEquals(12000, $response1->json('data.price'));
        $response1->assertJsonPath('data.description', 'Fashion House special luxury edition watch')
            ->assertJsonPath('data.thumbnail', 'https://example.com/fashion-watch.jpg');

        // Check Tech Store storefront for Smart Watch
        $response2 = $this->getJson('/api/v1/storefront/tech-store/products/smart-watch');
        $response2->assertStatus(200);
        $this->assertEquals(10500, $response2->json('data.price'));
        // Fallback to global description!
        $response2->assertJsonPath('data.description', 'Global smartwatch description')
            // Fallback to global thumbnail!
            ->assertJsonPath('data.thumbnail', 'https://example.com/global-watch.jpg');
    }

    public function test_customer_storefront_returns_404_for_unassigned_product(): void
    {
        // Try accessing Tech Store's exclusive product under Fashion House storefront
        $response = $this->getJson('/api/v1/storefront/fashion-house/products/mechanical-numpad');
        $response->assertStatus(404);
    }

    public function test_customer_storefront_returns_404_for_inactive_shop(): void
    {
        $this->shop1->update(['status' => 'inactive']);

        $response = $this->getJson('/api/v1/storefront/fashion-house');
        $response->assertStatus(404);

        $responseProducts = $this->getJson('/api/v1/storefront/fashion-house/products');
        $responseProducts->assertStatus(404);
    }
}
