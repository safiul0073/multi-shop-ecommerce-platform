"use client";

import { ProductImage } from "@/components/ui/product-image";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ShopProduct } from "@/types";
import {
  XCircle,
  Boxes,
  CheckCircle2,
  Compass,
  ExternalLink,
  PlusCircle,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function OwnerDashboardPage() {
  const { primaryShop } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["owner", "dashboard", primaryShop?.id],
    queryFn: async () => {
      const res = await api.get(`/owner/dashboard${primaryShop?.id ? `?shop_id=${primaryShop.id}` : ""}`);
      return res.data.data;
    },
  });

  const metrics = data?.metrics || {
    total_products: 0,
    active_listings: 0,
    inactive_listings: 0,
  };

  const recentProducts: ShopProduct[] = data?.recent_products || [];
  const shop = data?.shop || primaryShop;

  return (
    <DashboardLayout
      allowedRole="shop_owner"
      title="Dashboard"
      description="Your listings and storefront at a glance"
      actions={
        shop && (
          <Link href={`/store/${shop.slug}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> View Live Storefront
            </Button>
          </Link>
        )
      }
    >
      {shop && (
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {shop.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{shop.name}</h2>
                  <StatusBadge status={shop.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {shop.description || "No shop description set yet."}
                </p>
                <p className="text-xs font-mono text-indigo-600 mt-1">
                  Public URL: /store/{shop.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Link href="/owner/catalog" className="flex-1 sm:flex-none">
                <Button className="w-full gap-2">
                  <Compass className="h-4 w-4" /> Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Products"
          value={isLoading ? "-" : metrics.total_products}
          icon={Boxes}
          color="indigo"
          description="Total products added to your shop"
        />
        <StatCard
          title="Active listings"
          value={isLoading ? "-" : metrics.active_listings}
          icon={CheckCircle2}
          color="emerald"
          description="Visible to customers in storefront"
        />
        <StatCard
          title="Inactive listings"
          value={isLoading ? "-" : metrics.inactive_listings}
          icon={XCircle}
          color="amber"
          description="Hidden from customers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h3>

          <Link href="/owner/catalog" className="block">
            <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                    Browse Shared Catalog
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Discover and add global products with your custom pricing
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/owner/catalog?create=true" className="block">
            <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                    Create New Product
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add a master product to global catalog and auto-list in shop
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/owner/my-products" className="block">
            <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Boxes className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                    Manage My Shop Listings
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update selling prices, thumbnails, and visibility
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Shop Inventory</h3>
              <p className="text-xs text-slate-400">Products currently listed in your storefront</p>
            </div>
            <Link
              href="/owner/my-products"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              View All ({metrics.total_products})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-sm">No products added yet.</p>
                <p className="text-slate-400 text-xs mt-1">Browse the global catalog to add products.</p>
                <Link href="/owner/catalog" className="inline-block mt-3">
                  <Button size="sm" variant="outline">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              recentProducts.map((listing) => (
                <div key={listing.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ProductImage src={listing.effective_thumbnail} alt={listing.product?.name ?? ""} className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-slate-200" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{listing.product?.name}</p>
                      <p className="text-xs text-slate-400 font-mono">SKU: {listing.product?.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 block">
                      {formatPrice(listing.price)}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
