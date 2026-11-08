<?php

namespace App\Policies;

use App\Models\ShopProduct;
use App\Models\User;

class ShopProductPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function view(User $user, ShopProduct $shopProduct): bool
    {
        return $shopProduct->shop && $shopProduct->shop->owner_id === $user->id;
    }

    public function update(User $user, ShopProduct $shopProduct): bool
    {
        return $shopProduct->shop && $shopProduct->shop->owner_id === $user->id;
    }

    public function delete(User $user, ShopProduct $shopProduct): bool
    {
        return $shopProduct->shop && $shopProduct->shop->owner_id === $user->id;
    }
}
