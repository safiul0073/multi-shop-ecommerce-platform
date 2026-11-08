export type UserRole = "admin" | "shop_owner";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  shops_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: number;
  owner_id: number;
  owner?: User;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  status: "active" | "inactive";
  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  thumbnail: string | null;
  created_by: number;
  creator?: User;
  adoption_count: number;
  is_listed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopProduct {
  id: number;
  shop_id: number;
  product_id: number;
  price: number;
  price_formatted: string;
  description: string | null;
  thumbnail: string | null;
  effective_description: string;
  effective_thumbnail: string;
  status: "active" | "inactive";
  product?: Product;
  shop?: Shop;
  created_at: string;
  updated_at: string;
}

export interface StorefrontShop {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  status: "active" | "inactive";
}

export interface StorefrontProduct {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  price_formatted: string;
  currency_symbol: string;
  description: string;
  thumbnail: string;
  status: "active" | "inactive";
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  errors?: Record<string, string[]>;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
