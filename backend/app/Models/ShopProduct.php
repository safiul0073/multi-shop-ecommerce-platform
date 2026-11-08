<?php

namespace App\Models;

use App\Enums\ShopProductStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ShopProduct extends Pivot
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'shop_products';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;

    protected $fillable = [
        'shop_id',
        'product_id',
        'price',
        'description',
        'thumbnail',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'status' => ShopProductStatus::class,
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ShopProductStatus::ACTIVE);
    }

    /**
     * Resolved effective description (custom or fallback to global).
     */
    public function getEffectiveDescription(): ?string
    {
        return !empty($this->description) ? $this->description : $this->product?->description;
    }

    /**
     * Resolved effective thumbnail (custom or fallback to global).
     */
    public function getEffectiveThumbnail(): ?string
    {
        return !empty($this->thumbnail) ? $this->thumbnail : $this->product?->thumbnail;
    }
}
