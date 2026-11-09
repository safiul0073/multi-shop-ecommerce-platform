<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    public function upload(UploadedFile $file, string $folder = 'uploads'): string
    {
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid()->toString() . '.' . $extension;
        $path = $file->storeAs($folder, $fileName, 'public');

        return Storage::disk('public')->url($path);
    }

    public function replace(?string $oldUrl, UploadedFile $newFile, string $folder = 'uploads'): string
    {
        if ($oldUrl) {
            $this->delete($oldUrl);
        }

        return $this->upload($newFile, $folder);
    }

    /**
     * Safely delete an uploaded file by its URL or relative path.
     */
    public function delete(?string $url): bool
    {
        if (blank($url)) {
            return false;
        }

        $parsedUrl = parse_url($url, PHP_URL_PATH);
        if ($parsedUrl) {
            $relativePath = preg_replace('#^/?storage/#', '', $parsedUrl);
            if (Storage::disk('public')->exists($relativePath)) {
                return Storage::disk('public')->delete($relativePath);
            }
        }

        return false;
    }

    public function fallbackProductImage(): string
    {
        return asset('images/product-placeholder.svg');
    }

    public function fallbackShopLogo(): string
    {
        return asset('images/shop-placeholder.svg');
    }
}
