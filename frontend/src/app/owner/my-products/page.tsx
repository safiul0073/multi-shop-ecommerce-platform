"use client";

import { toast } from "sonner";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatPrice } from "@/lib/utils";
import { ShopProduct } from "@/types";
import {
  Search,
  Package,
  Edit2,
  Trash2,
  Plus,
  Eye,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function OwnerMyProductsPage() {
  const queryClient = useQueryClient();
  const { primaryShop } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [editListing, setEditListing] = useState<ShopProduct | null>(null);
  const [deleteListingId, setDeleteListingId] = useState<number | null>(null);
  const [viewListingDetail, setViewListingDetail] = useState<ShopProduct | null>(null);

  // Form states
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [formError, setFormError] = useState("");

  // Query shop listings
  const { data: listingsData, isLoading } = useQuery({
    queryKey: ["owner", "my-products", primaryShop?.id, search, statusFilter, page],
    enabled: !!primaryShop,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("per_page", "15");

      const res = await api.get(`/owner/shops/${primaryShop?.id}/products?${params.toString()}`);
      return res.data;
    },
  });

  // Update listing mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editListing || !primaryShop) return;
      setFormError("");
      const res = await api.put(`/owner/shops/${primaryShop.id}/products/${editListing.id}`, {
        price: parseFloat(price),
        description: description || null,
        thumbnail: thumbnail || null,
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Listing updated");
      queryClient.invalidateQueries({ queryKey: ["owner", "my-products"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "catalog"] });
      setEditListing(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setFormError(err.response?.data?.message || "Failed to update listing.");
      toast.error(err.response?.data?.message || "Failed to update listing.");
    },
  });

  // Remove listing mutation (does NOT delete global product)
  const removeMutation = useMutation({
    mutationFn: async (shopProductId: number) => {
      if (!primaryShop) return;
      await api.delete(`/owner/shops/${primaryShop.id}/products/${shopProductId}`);
    },
    onSuccess: () => {
      toast.success("Listing removed");
      queryClient.invalidateQueries({ queryKey: ["owner", "my-products"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "catalog"] });
      setDeleteListingId(null);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const openEdit = (listing: ShopProduct) => {
    setEditListing(listing);
    setPrice(listing.price.toString());
    setDescription(listing.description || "");
    setThumbnail(listing.thumbnail || "");
    setStatus(listing.status);
    setFormError("");
  };

  const listings: ShopProduct[] = listingsData?.data || [];
  const meta = listingsData?.meta;

  return (
    <DashboardLayout
      allowedRole="shop_owner"
      title="My products"
      description={`Manage product listings, pricing, and visibility for ${primaryShop?.name}`}
      actions={
        <Link href="/owner/catalog">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Products from Catalog
          </Button>
        </Link>
      }
    >
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search listed products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Selling Price</th>
                <th className="px-6 py-3 font-medium">Customization</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-0"><TableSkeleton rows={4} /></td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No products listed in your shop yet.</p>
                    <Link href="/owner/catalog" className="inline-block mt-3">
                      <Button size="sm" variant="outline">Browse Shared Catalog</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.product?.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                            {item.effective_description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                      {item.product?.sku}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {item.description || item.thumbnail ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                          Customized
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                          Using Catalog Info
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon" className="group h-8 w-8"
                          onClick={() => setViewListingDetail(item)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon" className="group h-8 w-8"
                          onClick={() => openEdit(item)}
                          title="Edit Listing"
                        >
                          <Edit2 className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon" className="group h-8 w-8"
                          onClick={() => setDeleteListingId(item.id)}
                          title="Remove from Shop"
                        >
                          <Trash2 className="h-4 w-4 text-slate-500 group-hover:text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
            <span>
              Page {meta.current_page} of {meta.last_page} ({meta.total} listings)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT LISTING MODAL */}
      <Modal
        isOpen={!!editListing}
        onClose={() => setEditListing(null)}
        title={`Edit Listing: ${editListing?.product?.name}`}
        description="Changes here only affect your shop storefront and do not modify the global catalog or other shops."
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Selling Price (৳ BDT) *</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Custom Description</label>
            <Textarea
              placeholder="Leave blank to fallback to global description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-slate-400">
              Fallback: {editListing?.product?.description || "None"}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Custom Thumbnail URL</label>
            <Input
              placeholder="Leave blank to fallback to global thumbnail..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Listing Status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active (Visible in storefront)</option>
              <option value="inactive">Inactive (Hidden from storefront)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditListing(null)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              Save Listing
            </Button>
          </div>
        </div>
      </Modal>

      {/* REMOVE LISTING CONFIRMATION */}
      <Modal
        isOpen={!!deleteListingId}
        onClose={() => setDeleteListingId(null)}
        title="Remove Listing From Shop"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>
              This will remove the product from your shop storefront only. The global master product will remain intact in the shared catalog.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeleteListingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteListingId && removeMutation.mutate(deleteListingId)}
              isLoading={removeMutation.isPending}
            >
              Confirm Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* LISTING DETAILS VIEW */}
      <Modal
        isOpen={!!viewListingDetail}
        onClose={() => setViewListingDetail(null)}
        title={`Listing: ${viewListingDetail?.product?.name}`}
        maxWidth="md"
      >
        {viewListingDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400">Selling Price</p>
                <p className="text-base font-bold text-slate-900">{formatPrice(viewListingDetail.price)}</p>
              </div>
              <div>
                <p className="text-slate-400">SKU</p>
                <p className="font-mono font-semibold text-slate-800">{viewListingDetail.product?.sku}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-700">Custom Shop Description</p>
              <p className="text-slate-600 mt-1">{viewListingDetail.description || "(None - using catalog fallback)"}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-700">Global Fallback Description</p>
              <p className="text-slate-500 mt-1">{viewListingDetail.product?.description || "None"}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
