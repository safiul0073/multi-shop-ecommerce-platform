"use client";

import React, { useState, use, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { StorefrontShop, StorefrontProduct } from "@/types";
import { Search, Mail, Phone, MapPin, Store, Truck, ShieldCheck, RotateCcw, PackageSearch } from "lucide-react";

function StorefrontContent({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = use(params);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StorefrontProduct | null>(null);

  const { data: shop, isLoading: isShopLoading, isError: isShopError } = useQuery({
    queryKey: ["storefront", "shop", shopSlug],
    queryFn: async () => (await api.get(`/storefront/${shopSlug}`)).data.data as StorefrontShop,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["storefront", "products", shopSlug, search],
    queryFn: async () => {
      const qs = new URLSearchParams({ per_page: "48" });
      if (search) qs.append("search", search);
      return (await api.get(`/storefront/${shopSlug}/products?${qs}`)).data.data as StorefrontProduct[];
    },
    enabled: !!shop,
  });
  const products = productsData ?? [];

  if (isShopLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isShopError || !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-900">Shop not found</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            This shop doesn&apos;t exist or is currently closed.
          </p>
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              {shop.name.charAt(0)}
            </div>
            <span className="truncate font-semibold tracking-tight text-slate-900">{shop.name}</span>
          </div>
          <div className="relative hidden w-80 md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search products"
            />
          </div>
          <Link href="/login" className="shrink-0 text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
        </div>
      </header>

      <section className="relative h-56 overflow-hidden bg-slate-900 sm:h-72">
        {shop.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{shop.name}</h1>
          {shop.description && (
            <p className="mt-2 max-w-xl text-sm text-slate-200 sm:text-base">{shop.description}</p>
          )}
        </div>
      </section>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-4 text-sm text-slate-600 sm:grid-cols-3 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-slate-400" /> Delivery across Bangladesh</span>
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-400" /> Genuine products</span>
          <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-slate-400" /> 7-day easy returns</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {search ? `Results for “${search}”` : "All products"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isProductsLoading ? "Loading…" : `${products.length} item${products.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="relative md:hidden">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-900">No products found</p>
            <p className="mt-1 text-sm text-slate-500">
              {search ? "Try a different search term." : "This shop hasn't listed any products yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelected(product)}
                className="group text-left focus:outline-none"
              >
                <ProductImage
                  src={product.thumbnail}
                  alt={product.name}
                  className="aspect-square w-full rounded-xl ring-1 ring-slate-200 transition group-hover:ring-slate-300 group-focus-visible:ring-2 group-focus-visible:ring-slate-900 [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-105"
                />
                <h3 className="mt-3 line-clamp-1 text-sm font-medium text-slate-900">{product.name}</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{product.description}</p>
                <p className="mt-1.5 font-semibold tabular-nums text-slate-900">{formatPrice(product.price)}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || "Product"}
        maxWidth="2xl"
      >
        {selected && (
          <div className="grid gap-6 sm:grid-cols-2">
            <ProductImage src={selected.thumbnail} alt={selected.name} className="aspect-square w-full rounded-lg" />
            <div className="flex flex-col">
              <p className="text-2xl font-semibold tabular-nums text-slate-900">{formatPrice(selected.price)}</p>
              <p className="mt-1 text-xs text-slate-500">SKU {selected.sku}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {selected.description}
              </p>
              <div className="mt-auto space-y-2 pt-6 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-slate-400" /> Ships in 1–3 business days</p>
                <p className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /> Sold by {shop.name}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="font-semibold text-slate-900">{shop.name}</p>
            <p className="mt-1 text-slate-500">Prices in Bangladeshi Taka (৳).</p>
          </div>
          <div className="space-y-2 text-slate-600">
            {shop.contact_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {shop.contact_email}</p>}
            {shop.contact_phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {shop.contact_phone}</p>}
          </div>
          {shop.address && (
            <p className="flex items-start gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {shop.address}</p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function StorefrontPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <StorefrontContent params={params} />
    </Suspense>
  );
}
