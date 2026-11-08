<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ShopService
{
    public function __construct(
        protected ImageUploadService $imageUploadService
    ) {}

    /**
     * List shops with filtering, search, and pagination.
     */
    public function listShops(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Shop::query()->with('owner')->withCount('shopProducts');

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['owner_id'])) {
            $query->where('owner_id', $filters['owner_id']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Create a shop, optionally creating a new shop owner account transactionally.
     */
    public function createShopWithOptionalOwner(array $shopData, ?array $newOwnerData = null): Shop
    {
        return DB::transaction(function () use ($shopData, $newOwnerData) {
            $ownerId = $shopData['owner_id'] ?? null;

            if ($newOwnerData) {
                $owner = User::create([
                    'name' => $newOwnerData['name'],
                    'email' => $newOwnerData['email'],
                    'password' => Hash::make($newOwnerData['password']),
                    'role' => UserRole::SHOP_OWNER,
                    'email_verified_at' => now(),
                ]);
                $ownerId = $owner->id;
            }

            if (!$ownerId) {
                throw new InvalidArgumentException('A shop must have an associated owner.');
            }

            // Ensure owner exists and is a shop owner
            $owner = User::findOrFail($ownerId);
            if ($owner->role !== UserRole::SHOP_OWNER) {
                throw new InvalidArgumentException('Assigned user must have the shop owner role.');
            }

            $slug = !empty($shopData['slug']) ? Str::slug($shopData['slug']) : Str::slug($shopData['name']);
            $baseSlug = $slug;
            $count = 1;
            while (Shop::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$count}";
                $count++;
            }

            return Shop::create([
                'owner_id' => $ownerId,
                'name' => $shopData['name'],
                'slug' => $slug,
                'description' => $shopData['description'] ?? null,
                'logo' => $shopData['logo'] ?? null,
                'banner' => $shopData['banner'] ?? null,
                'contact_email' => $shopData['contact_email'] ?? null,
                'contact_phone' => $shopData['contact_phone'] ?? null,
                'address' => $shopData['address'] ?? null,
                'status' => $shopData['status'] ?? 'active',
            ]);
        });
    }

    /**
     * Update shop details.
     */
    public function updateShop(Shop $shop, array $data): Shop
    {
        if (!empty($data['slug']) && $data['slug'] !== $shop->slug) {
            $data['slug'] = Str::slug($data['slug']);
        }

        $shop->update($data);

        return $shop->fresh(['owner']);
    }

    /**
     * Delete / Deactivate a shop.
     */
    public function deleteShop(Shop $shop): bool
    {
        return (bool) $shop->delete();
    }
}
