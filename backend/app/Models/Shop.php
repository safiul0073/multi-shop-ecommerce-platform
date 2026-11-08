<?php

namespace App\Models;

use App\Enums\ShopStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shop extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'description',
        'logo',
        'banner',
        'contact_email',
        'contact_phone',
        'address',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => ShopStatus::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'shop_products')
            ->withPivot(['id', 'price', 'description', 'thumbnail', 'status'])
            ->withTimestamps()
            ->using(ShopProduct::class);
    }

    public function shopProducts(): HasMany
    {
        return $this->hasMany(ShopProduct::class, 'shop_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ShopStatus::ACTIVE);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('slug', 'like', "%{$term}%")
              ->orWhere('contact_email', 'like', "%{$term}%");
        });
    }
}
