<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_log_in_successfully(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role', 'admin')
            ->assertJsonStructure([
                'data' => ['user', 'role', 'token'],
            ]);
    }

    public function test_shop_owner_can_log_in_successfully(): void
    {
        $owner = User::create([
            'name' => 'Owner User',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role', 'shop_owner');
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_unauthenticated_users_cannot_access_protected_endpoints(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard');
        $response->assertStatus(401);

        $responseOwner = $this->getJson('/api/v1/owner/dashboard');
        $responseOwner->assertStatus(401);
    }

    public function test_shop_owners_cannot_access_admin_endpoints(): void
    {
        $owner = User::create([
            'name' => 'Shop Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SHOP_OWNER,
        ]);

        $token = $owner->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }
}
