<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadImageRequest;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    public function __construct(
        protected ImageUploadService $imageUploadService
    ) {}

    public function upload(UploadImageRequest $request): JsonResponse
    {
        $file = $request->file('image');
        $folder = $request->input('folder', 'uploads');

        $url = $this->imageUploadService->upload($file, $folder);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully.',
            'data' => [
                'url' => $url,
            ],
        ], 201);
    }
}
