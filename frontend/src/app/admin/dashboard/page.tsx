"use client";

import { ProductImage } from "@/components/ui/product-image";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Shop, Product } from "@/types";
import {
  XCircle,
  Store,
  Package,
  Users,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data.data;
    },
  });

  const metrics = data?.metrics || {
    total_shops: 0,
    active_shops: 0,
    inactive_shops: 0,
    total_products: 0,
    total_shop_owners: 0,
    total_listings: 0,
  };

  const recentShops: Shop[] = data?.recent_shops || [];
  const recentProducts: Product[] = data?.recent_products || [];

  return (
    <DashboardLayout
      allowedRole="admin"
      title="Overview"
      description="Shops, owners and catalog activity across the platform"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total shops"
          value={isLoading ? "-" : metrics.total_shops}
          icon={Store}
          color="indigo"
          description="Registered shops"
        />
        <StatCard
          title="Active shops"
          value={isLoading ? "-" : metrics.active_shops}
          icon={CheckCircle2}
          color="emerald"
          description="Visible to customers"
        />
        <StatCard
          title="Inactive shops"
          value={isLoading ? "-" : metrics.inactive_shops}
          icon={XCircle}
          color="rose"
          description="Hidden from customers"
        />
        <StatCard
          title="Catalog products"
          value={isLoading ? "-" : metrics.total_products}
          icon={Package}
          color="sky"
          description="In the shared catalog"
        />
        <StatCard
          title="Shop owners"
          value={isLoading ? "-" : metrics.total_shop_owners}
          icon={Users}
          color="indigo"
          description="Registered accounts"
        />
        <StatCard
          title="Total listings"
          value={isLoading ? "-" : metrics.total_listings}
          icon={Layers}
          color="amber"
          description="Products listed in shops"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recently Created Shops</h3>
              <p className="text-xs text-slate-400">Latest storefronts added to the platform</p>
            </div>
            <Link
              href="/admin/shops"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentShops.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No shops created yet.</div>
            ) : (
              recentShops.map((shop) => (
                <div key={shop.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{shop.name}</p>
                      <p className="text-xs text-slate-500">Owner: {shop.owner?.name || "Unassigned"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={shop.status} />
                    <p className="text-xs text-slate-400 mt-1">{formatDate(shop.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Catalog Additions</h3>
              <p className="text-xs text-slate-400">Products in the centralized shared catalog</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No products in catalog yet.</div>
            ) : (
              recentProducts.map((prod) => (
                <div key={prod.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ProductImage src={prod.thumbnail} alt={prod.name ?? ""} className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-slate-200" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{prod.name}</p>
                      <p className="text-xs text-slate-400 font-mono">SKU: {prod.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Added by {prod.creator?.name || "Admin"}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(prod.created_at)}</p>
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
