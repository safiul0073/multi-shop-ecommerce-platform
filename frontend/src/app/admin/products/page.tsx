"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { Product } from "@/types";
import {
  Plus,
  Search,
  Package,
  Trash2,
  Edit2,
  Eye,
  Store,
  Layers,
} from "lucide-react";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Query global products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin", "products", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data;
    },
  });

  // Query details including which shops adopted the product
  const { data: productWithShops } = useQuery({
    queryKey: ["admin", "product-detail", selectedProductDetail?.id],
    enabled: !!selectedProductDetail,
    queryFn: async () => {
      const res = await api.get(`/admin/products/${selectedProductDetail?.id}`);
      return res.data;
    },
  });

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      setFormError("");
      const res = await api.post("/admin/products", {
        name,
        sku: sku || undefined,
        description: description || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create product.");
    },
  });

  // Update Product Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editProduct) return;
      setFormError("");
      const res = await api.put(`/admin/products/${editProduct.id}`, {
        name,
        sku,
        description,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setEditProduct(null);
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setFormError(err.response?.data?.message || "Failed to update product.");
    },
  });

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDeleteProductId(null);
    },
  });

  const resetForm = () => {
    setName("");
    setSku("");
    setDescription("");
    setFormError("");
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setSku(p.sku);
    setDescription(p.description || "");
    setFormError("");
  };

  const products: Product[] = productsData?.data || [];
  const meta = productsData?.meta;

  return (
    <DashboardLayout
      allowedRole="admin"
      title="Shared Product Catalog"
      description="Central product repository available across all merchant shops"
      actions={
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Catalog Product
        </Button>
      }
    >
      {/* Search Toolbar */}
      <div className="flex gap-3 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search catalog by name, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Created By</th>
                <th className="px-6 py-3.5">Shop Adoption</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No catalog products found.</p>
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{prod.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{prod.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        {prod.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700 block">
                        {prod.creator?.name || "System Admin"}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {prod.creator?.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-xs font-semibold text-indigo-700">
                        <Store className="h-3.5 w-3.5 text-indigo-500" />
                        {prod.adoption_count} {prod.adoption_count === 1 ? "Shop" : "Shops"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(prod.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedProductDetail(prod)}
                          title="View Adoption"
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(prod)}
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteProductId(prod.id)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
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
              Page {meta.current_page} of {meta.last_page} ({meta.total} products)
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

      {/* CREATE PRODUCT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Catalog Product"
        description="Creates a product in the global catalog. Available for any shop owner to list."
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Product Name *</label>
            <Input
              placeholder="e.g. Ergonomic Office Chair"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">SKU (Stock Keeping Unit) *</label>
            <Input
              placeholder="e.g. SKU-FURN-09"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Global Description</label>
            <Textarea
              placeholder="Detailed specifications, dimensions, features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>
              Create Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Edit Catalog Product"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Product Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">SKU</label>
            <Input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Global Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditProduct(null)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        title="Remove From Shared Catalog"
        description="Are you sure? This will remove the master product."
        maxWidth="sm"
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setDeleteProductId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* PRODUCT ADOPTION DETAILS MODAL */}
      <Modal
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        title={`Adoption Telemetry: ${selectedProductDetail?.name}`}
        maxWidth="lg"
      >
        {selectedProductDetail && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <p className="text-slate-400">SKU: <span className="font-mono text-slate-800 font-semibold">{selectedProductDetail.sku}</span></p>
              <p className="text-slate-600 mt-1">{selectedProductDetail.description || "No global description provided."}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Shops Listing This Product ({productWithShops?.shops_using?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
                {!productWithShops?.shops_using || productWithShops.shops_using.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No shops have currently listed this product.
                  </div>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  productWithShops.shops_using.map((listing: any) => (
                    <div key={listing.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <Store className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-slate-800">{listing.shop?.name}</p>
                          <p className="text-slate-400">/store/{listing.shop?.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">৳{listing.price}</span>
                        <p className="text-[10px] text-slate-400">{listing.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
