<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SharedCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $owner1;
    protected User $owner2;
    protected Shop $shop1;
    protected Shop $shop2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
        ]);

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
    }

    public function test_owner_created_product_immediately_becomes_available_in_shared_catalog_for_other_owners(): void
    {
        // Owner 1 creates product and auto-lists in Shop 1
        Sanctum::actingAs($this->owner1);
        $response = $this->postJson('/api/v1/owner/products', [
            'shop_id' => $this->shop1->id,
            'name' => 'Shared Ergonomic Pillow',
            'sku' => 'SKU-PIL-01',
            'description' => 'Memory foam support pillow',
            'price' => 1200.00,
        ]);

        $response->assertStatus(201);

        // Verify product was created in global catalog
        $this->assertDatabaseHas('products', [
            'sku' => 'SKU-PIL-01',
            'created_by' => $this->owner1->id,
        ]);

        // Owner 2 queries shared catalog -> MUST find the product created by Owner 1!
        Sanctum::actingAs($this->owner2);
        $catalogResponse = $this->getJson("/api/v1/owner/catalog?shop_id={$this->shop2->id}&search=SKU-PIL-01");

        $catalogResponse->assertStatus(200)
            ->assertJsonPath('data.0.sku', 'SKU-PIL-01')
            ->assertJsonPath('data.0.is_listed', false);
    }

    public function test_admin_created_products_appear_in_shared_catalog(): void
    {
        Product::create([
            'created_by' => $this->admin->id,
            'name' => 'Admin Flagship Phone',
            'slug' => 'admin-flagship-phone',
            'sku' => 'SKU-PHO-99',
            'description' => 'Flagship smartphone',
        ]);

        Sanctum::actingAs($this->owner1);
        $response = $this->getJson("/api/v1/owner/catalog?shop_id={$this->shop1->id}&search=SKU-PHO-99");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.sku', 'SKU-PHO-99')
            ->assertJsonPath('data.0.name', 'Admin Flagship Phone');
    }

    public function test_adding_existing_product_to_shop_does_not_duplicate_global_product_record(): void
    {
        $globalProduct = Product::create([
            'created_by' => $this->admin->id,
            'name' => 'Universal USB-C Cable',
            'slug' => 'universal-usbc-cable',
            'sku' => 'SKU-CAB-01',
            'description' => 'Braided fast charging cable',
        ]);

        $initialGlobalProductCount = Product::count();

        // Shop 1 adds the product
        Sanctum::actingAs($this->owner1);
        $res1 = $this->postJson("/api/v1/owner/shops/{$this->shop1->id}/products", [
            'product_id' => $globalProduct->id,
            'price' => 350.00,
        ]);
        $res1->assertStatus(201);

        // Shop 2 adds the SAME product
        Sanctum::actingAs($this->owner2);
        $res2 = $this->postJson("/api/v1/owner/shops/{$this->shop2->id}/products", [
            'product_id' => $globalProduct->id,
            'price' => 450.00,
        ]);
        $res2->assertStatus(201);

        // The global product record must remain exactly 1 (not duplicated!)
        $this->assertEquals($initialGlobalProductCount, Product::count());
        $this->assertEquals(2, $globalProduct->shops()->count());
    }

    public function test_prevent_duplicate_product_assignment_to_same_shop(): void
    {
        $globalProduct = Product::create([
            'created_by' => $this->admin->id,
            'name' => 'Single Assignment Item',
            'slug' => 'single-assignment-item',
            'sku' => 'SKU-ITEM-01',
        ]);

        Sanctum::actingAs($this->owner1);
        // First assignment succeeds
        $res1 = $this->postJson("/api/v1/owner/shops/{$this->shop1->id}/products", [
            'product_id' => $globalProduct->id,
            'price' => 100.00,
        ]);
        $res1->assertStatus(201);

        // Second assignment to SAME shop must be rejected
        $res2 = $this->postJson("/api/v1/owner/shops/{$this->shop1->id}/products", [
            'product_id' => $globalProduct->id,
            'price' => 120.00,
        ]);
        $res2->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
