<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
        ]);

        $this->adminToken = $this->admin->createToken('admin-token')->plainTextToken;
    }

    public function test_admin_can_create_shop_with_existing_owner(): void
    {
        $owner = User::create([
            'name' => 'Existing Owner',
            'email' => 'existing@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/v1/admin/shops', [
                'name' => 'New Trendy Shop',
                'owner_id' => $owner->id,
                'description' => 'A trendy new boutique',
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'New Trendy Shop')
            ->assertJsonPath('data.slug', 'new-trendy-shop');

        $this->assertDatabaseHas('shops', [
            'name' => 'New Trendy Shop',
            'owner_id' => $owner->id,
        ]);
    }

    public function test_admin_can_create_shop_and_new_owner_transactionally(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/v1/admin/shops', [
                'name' => 'Auto Tenant Store',
                'new_owner' => [
                    'name' => 'Brand New Owner',
                    'email' => 'brandnew@example.com',
                    'password' => 'secret1234',
                ],
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', [
            'email' => 'brandnew@example.com',
            'role' => 'shop_owner',
        ]);

        $this->assertDatabaseHas('shops', [
            'name' => 'Auto Tenant Store',
        ]);
    }

    public function test_admin_can_update_shop_information(): void
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Original Shop Name',
            'slug' => 'original-shop-name',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->putJson("/api/v1/admin/shops/{$shop->id}", [
                'name' => 'Updated Shop Name',
                'status' => 'inactive',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Shop Name')
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('shops', [
            'id' => $shop->id,
            'name' => 'Updated Shop Name',
            'status' => 'inactive',
        ]);
    }

    public function test_admin_can_delete_shop(): void
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $shop = Shop::create([
            'owner_id' => $owner->id,
            'name' => 'Shop To Delete',
            'slug' => 'shop-to-delete',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->deleteJson("/api/v1/admin/shops/{$shop->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('shops', ['id' => $shop->id]);
    }

    public function test_admin_can_create_catalog_product(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/v1/admin/products', [
                'name' => 'Master Wireless Mouse',
                'sku' => 'SKU-MOU-01',
                'description' => 'High precision optical sensor',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.sku', 'SKU-MOU-01');

        $this->assertDatabaseHas('products', [
            'sku' => 'SKU-MOU-01',
            'created_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_create_shop_owner_and_reset_password(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson('/api/v1/admin/shop-owners', [
                'name' => 'Merchant Test',
                'email' => 'merchant.test@example.com',
                'password' => 'initialpass123',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'merchant.test@example.com');

        $owner = User::where('email', 'merchant.test@example.com')->first();

        // Admin resets password
        $resetResponse = $this->withHeader('Authorization', "Bearer {$this->adminToken}")
            ->postJson("/api/v1/admin/shop-owners/{$owner->id}/reset-password", [
                'password' => 'newpassword123',
            ]);

        $resetResponse->assertStatus(200);

        $owner->refresh();
        $this->assertTrue(Hash::check('newpassword123', $owner->password));
    }
}
