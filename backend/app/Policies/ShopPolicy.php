<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isShopOwner();
    }

    public function view(User $user, Shop $shop): bool
    {
        return $shop->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Shop $shop): bool
    {
        return $shop->owner_id === $user->id;
    }

    public function delete(User $user, Shop $shop): bool
    {
        return false;
    }
}
