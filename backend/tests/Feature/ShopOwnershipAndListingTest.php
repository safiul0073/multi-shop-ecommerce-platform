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
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShopOwnershipAndListingTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner1;
    protected User $owner2;
    protected Shop $shop1;
    protected Shop $shop2;
    protected Product $sharedProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner1 = User::create([
            'name' => 'Owner One',
            'email' => 'owner1@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $this->owner2 = User::create([
            'name' => 'Owner Two',
            'email' => 'owner2@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $this->shop1 = Shop::create([
            'owner_id' => $this->owner1->id,
            'name' => 'Shop One',
            'slug' => 'shop-one',
            'status' => 'active',
        ]);

        $this->shop2 = Shop::create([
            'owner_id' => $this->owner2->id,
            'name' => 'Shop Two',
            'slug' => 'shop-two',
            'status' => 'active',
        ]);

        $this->sharedProduct = Product::create([
            'created_by' => $this->owner1->id,
            'name' => 'Cross-Shop Gaming Chair',
            'slug' => 'cross-shop-gaming-chair',
            'sku' => 'SKU-CHR-01',
            'description' => 'Global description for gaming chair',
        ]);
    }

    public function test_owner_cannot_access_another_owners_shop(): void
    {
        // Owner 2 tries to access Shop 1 settings
        Sanctum::actingAs($this->owner2);
        $response = $this->getJson("/api/v1/owner/shops/{$this->shop1->id}");

        $response->assertStatus(403);
    }

    public function test_owner_cannot_add_product_to_another_owners_shop(): void
    {
        // Owner 2 tries to add a product to Shop 1
        Sanctum::actingAs($this->owner2);
        $response = $this->postJson("/api/v1/owner/shops/{$this->shop1->id}/products", [
            'product_id' => $this->sharedProduct->id,
            'price' => 500.00,
        ]);

        $response->assertStatus(403);
    }

    public function test_different_shops_can_set_different_prices_and_descriptions_for_same_product(): void
    {
        // Shop 1 lists product at ৳500 with custom description A
        Sanctum::actingAs($this->owner1);
        $res1 = $this->postJson("/api/v1/owner/shops/{$this->shop1->id}/products", [
            'product_id' => $this->sharedProduct->id,
            'price' => 500.00,
            'description' => 'Shop 1 special custom edition',
            'thumbnail' => 'https://example.com/shop1-thumb.jpg',
        ]);
        $res1->assertStatus(201);

        // Shop 2 lists product at ৳650 with custom description B
        Sanctum::actingAs($this->owner2);
        $res2 = $this->postJson("/api/v1/owner/shops/{$this->shop2->id}/products", [
            'product_id' => $this->sharedProduct->id,
            'price' => 650.00,
            'description' => 'Shop 2 premium bundle edition',
            'thumbnail' => 'https://example.com/shop2-thumb.jpg',
        ]);
        $res2->assertStatus(201);

        // Verify Shop 1 listing
        $listing1 = ShopProduct::where('shop_id', $this->shop1->id)
            ->where('product_id', $this->sharedProduct->id)
            ->first();
        $this->assertEquals(500.00, (float) $listing1->price);
        $this->assertEquals('Shop 1 special custom edition', $listing1->description);
        $this->assertEquals('https://example.com/shop1-thumb.jpg', $listing1->thumbnail);

        // Verify Shop 2 listing
        $listing2 = ShopProduct::where('shop_id', $this->shop2->id)
            ->where('product_id', $this->sharedProduct->id)
            ->first();
        $this->assertEquals(650.00, (float) $listing2->price);
        $this->assertEquals('Shop 2 premium bundle edition', $listing2->description);
        $this->assertEquals('https://example.com/shop2-thumb.jpg', $listing2->thumbnail);
    }

    public function test_owner_cannot_update_another_shops_listing(): void
    {
        // Shop 1 creates listing
        $listing1 = ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $this->sharedProduct->id,
            'price' => 500.00,
            'status' => 'active',
        ]);

        // Owner 2 tries to update Shop 1's listing
        Sanctum::actingAs($this->owner2);
        $response = $this->putJson("/api/v1/owner/shops/{$this->shop1->id}/products/{$listing1->id}", [
            'price' => 999.00,
        ]);

        $response->assertStatus(403);
    }

    public function test_removing_listing_does_not_delete_global_product(): void
    {
        $listing1 = ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $this->sharedProduct->id,
            'price' => 500.00,
            'status' => 'active',
        ]);

        Sanctum::actingAs($this->owner1);
        $response = $this->deleteJson("/api/v1/owner/shops/{$this->shop1->id}/products/{$listing1->id}");

        $response->assertStatus(200);

        // Shop listing is deleted
        $this->assertDatabaseMissing('shop_products', ['id' => $listing1->id]);

        // Global product is STILL present in catalog!
        $this->assertDatabaseHas('products', ['id' => $this->sharedProduct->id]);
    }

    public function test_deactivating_listing_in_one_shop_does_not_affect_another_shop(): void
    {
        $listing1 = ShopProduct::create([
            'shop_id' => $this->shop1->id,
            'product_id' => $this->sharedProduct->id,
            'price' => 500.00,
            'status' => ShopProductStatus::ACTIVE,
        ]);

        $listing2 = ShopProduct::create([
            'shop_id' => $this->shop2->id,
            'product_id' => $this->sharedProduct->id,
            'price' => 650.00,
            'status' => ShopProductStatus::ACTIVE,
        ]);

        // Shop 1 deactivates its listing
        Sanctum::actingAs($this->owner1);
        $this->putJson("/api/v1/owner/shops/{$this->shop1->id}/products/{$listing1->id}", [
            'status' => 'inactive',
        ]);

        $listing1->refresh();
        $listing2->refresh();

        $this->assertEquals(ShopProductStatus::INACTIVE, $listing1->status);
        $this->assertEquals(ShopProductStatus::ACTIVE, $listing2->status); // Unaffected!
    }
}
