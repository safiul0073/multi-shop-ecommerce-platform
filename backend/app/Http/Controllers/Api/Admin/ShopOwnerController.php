<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetPasswordRequest;
use App\Http\Requests\Admin\StoreShopOwnerRequest;
use App\Http\Requests\Admin\UpdateShopOwnerRequest;
use App\Http\Resources\ShopResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ShopOwnerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', UserRole::SHOP_OWNER)
            ->withCount('shops');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $owners = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($owners),
            'meta' => [
                'current_page' => $owners->currentPage(),
                'last_page' => $owners->lastPage(),
                'per_page' => $owners->perPage(),
                'total' => $owners->total(),
            ],
        ]);
    }

    public function store(StoreShopOwnerRequest $request): JsonResponse
    {
        $owner = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => UserRole::SHOP_OWNER,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shop owner account created successfully.',
            'data' => new UserResource($owner),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role !== UserRole::SHOP_OWNER) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a shop owner.',
            ], 404);
        }

        $user->load('shops');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'shops' => ShopResource::collection($user->shops),
        ]);
    }

    public function update(UpdateShopOwnerRequest $request, User $user): JsonResponse
    {
        if ($user->role !== UserRole::SHOP_OWNER) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a shop owner.',
            ], 404);
        }

        $data = $request->safe()->only(['name', 'email']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Shop owner updated successfully.',
            'data' => new UserResource($user),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request, User $user): JsonResponse
    {
        if ($user->role !== UserRole::SHOP_OWNER) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a shop owner.',
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.',
        ]);
    }
}
