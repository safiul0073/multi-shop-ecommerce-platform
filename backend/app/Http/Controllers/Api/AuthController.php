<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\ShopResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue API bearer token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Revoke older tokens if needed or issue a clean new one
        $token = $user->createToken('auth_token')->plainTextToken;

        $user->load('shops');
        $primaryShop = $user->shops->first();

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => new UserResource($user),
                'role' => $user->role->value,
                'token' => $token,
                'primary_shop' => $primaryShop ? new ShopResource($primaryShop) : null,
            ],
        ]);
    }

    /**
     * Revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get the authenticated user's profile and shops.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('shops');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'role' => $user->role->value,
                'shops' => ShopResource::collection($user->shops),
                'primary_shop' => $user->shops->first() ? new ShopResource($user->shops->first()) : null,
            ],
        ]);
    }
}
