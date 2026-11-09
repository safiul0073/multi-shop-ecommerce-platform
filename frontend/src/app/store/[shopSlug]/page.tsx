"use client";

import React, { useState, use, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatPrice } from "@/lib/utils";
import { StorefrontShop, StorefrontProduct } from "@/types";
import {
  Search,
  Package,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Store,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

function StorefrontContent({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = use(params);

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);

  // Query shop profile
  const { data: shopData, isLoading: isShopLoading, isError: isShopError } = useQuery({
    queryKey: ["storefront", "shop", shopSlug],
    queryFn: async () => {
      const res = await api.get(`/storefront/${shopSlug}`);
      return res.data.data as StorefrontShop;
    },
  });

  // Query active products for this shop
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["storefront", "products", shopSlug, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await api.get(`/storefront/${shopSlug}/products?${params.toString()}`);
      return res.data.data as StorefrontProduct[];
    },
  });

  const shop = shopData;
  const products: StorefrontProduct[] = productsData || [];

  if (isShopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (isShopError || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Store Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            The shop you are looking for does not exist or is currently inactive.
          </p>
          <Link href="/login">
            <Button variant="outline">Return to Platform</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>Official Storefront for <strong className="text-white">{shop.name}</strong></span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">Powered by MultiShop Platform</span>
        </div>
        <Link href="/login" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0">
          Admin / Owner Login →
        </Link>
      </div>

      {/* Store Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
              {shop.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{shop.name}</h1>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                {shop.description || "Welcome to our official catalog storefront"}
              </p>
            </div>
          </div>

          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search in ${shop.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </header>

      {/* Shop Hero / Info Bar */}
      <div className="bg-linear-to-b from-white to-slate-50 border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
                <Store className="h-3 w-3" /> Verified Shop
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {shop.description || "Discover premium products hand-selected by our store team with guaranteed quality."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              {shop.contact_email && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{shop.contact_email}</span>
                </div>
              )}
              {shop.contact_phone && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{shop.contact_phone}</span>
                </div>
              )}
              {shop.address && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{shop.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Products</h2>
            <p className="text-xs text-slate-500">
              Showing {products.length} {products.length === 1 ? "active listing" : "active listings"} for this shop
            </p>
          </div>

          <div className="md:hidden w-48">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {isProductsLoading ? (
          <div className="py-24 text-center text-slate-400 text-sm">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No active products available</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              This shop has not published any active listings matching your criteria yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div>
                  <div className="aspect-square w-full rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center mb-4 overflow-hidden relative group-hover:bg-indigo-50/40 transition-colors">
                    <Package className="h-16 w-16 text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-300" />
                    <span className="absolute bottom-2.5 right-2.5 font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs">
                      {product.sku}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {product.description || "Standard catalog product specifications apply."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Price</span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="gap-1.5 shadow-sm group-hover:bg-indigo-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || "Product Details"}
        description={`Item listing from ${shop.name}`}
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Package className="h-20 w-20 text-slate-400" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Storefront Price</span>
                <p className="text-3xl font-black text-slate-900">{formatPrice(selectedProduct.price)}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold">SKU Identifier</span>
                <p className="font-mono font-bold text-slate-800 text-sm">{selectedProduct.sku}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProduct.description || "No customized product description."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                Sold directly by <strong>{shop.name}</strong> through the MultiShop Platform.
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Store Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-800">{shop.name} Storefront</p>
          <p className="text-slate-400">
            All prices are shown in Bangladeshi Taka (৳). Powered by Multi-Shop E-Commerce Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function StorefrontPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <StorefrontContent params={params} />
    </Suspense>
  );
}
