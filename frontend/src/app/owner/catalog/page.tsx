"use client";

import { toast } from "sonner";
import React, { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Product } from "@/types";
import {
  Search,
  Package,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";

function CatalogContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { primaryShop } = useAuth();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // "Add to Shop" form fields
  const [sellingPrice, setSellingPrice] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [addError, setAddError] = useState("");

  // "Create New Product" form fields
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCustomDesc, setNewProdCustomDesc] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open dialog from ?create=true
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Query shared catalog with is_listed calculated for primaryShop
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ["owner", "catalog", primaryShop?.id, search, page],
    enabled: !!primaryShop,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (primaryShop?.id) params.append("shop_id", primaryShop.id.toString());
      params.append("page", page.toString());
      params.append("per_page", "12");

      const res = await api.get(`/owner/catalog?${params.toString()}`);
      return res.data;
    },
  });

  // Add existing product to shop mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProductToAdd || !primaryShop) return;
      setAddError("");
      const res = await api.post(`/owner/shops/${primaryShop.id}/products`, {
        product_id: selectedProductToAdd.id,
        price: parseFloat(sellingPrice),
        description: customDescription || undefined,
        thumbnail: customThumbnail || undefined,
        status: "active",
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product added to your shop");
      queryClient.invalidateQueries({ queryKey: ["owner", "catalog"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "my-products"] });
      setSelectedProductToAdd(null);
      resetAddForm();
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      setAddError(err.response?.data?.message || err.message || "Failed to add product to shop.");
      toast.error(err.response?.data?.message || err.message || "Failed to add product to shop.");
    },
  });

  // Create new global product & auto-list mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!primaryShop) return;
      setCreateError("");
      const res = await api.post("/owner/products", {
        shop_id: primaryShop.id,
        name: newProdName,
        sku: newProdSku,
        description: newProdDesc || undefined,
        price: parseFloat(newProdPrice),
        listing_description: newProdCustomDesc || undefined,
        status: "active",
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product created and listed");
      queryClient.invalidateQueries({ queryKey: ["owner", "catalog"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "my-products"] });
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      setCreateError(err.response?.data?.message || err.message || "Failed to create product.");
      toast.error(err.response?.data?.message || err.message || "Failed to create product.");
    },
  });

  const resetAddForm = () => {
    setSellingPrice("");
    setCustomDescription("");
    setCustomThumbnail("");
    setAddError("");
  };

  const resetCreateForm = () => {
    setNewProdName("");
    setNewProdSku("");
    setNewProdDesc("");
    setNewProdPrice("");
    setNewProdCustomDesc("");
    setCreateError("");
  };

  const openAddModal = (product: Product) => {
    setSelectedProductToAdd(product);
    resetAddForm();
  };

  const products: Product[] = catalogData?.data || [];
  const meta = catalogData?.meta;

  return (
    <DashboardLayout
      allowedRole="shop_owner"
      title="Browse catalog"
      description="Browse central global inventory and configure custom selling prices for your shop"
      actions={
        <Button onClick={() => { resetCreateForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Create New Product
        </Button>
      }
    >
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Listing in: <span className="font-bold text-slate-800">{primaryShop?.name}</span>
        </div>
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading catalog products...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or create a new product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                {/* Thumbnail / Placeholder */}
                <div className="aspect-video w-full rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center mb-4 overflow-hidden relative">
                  <Package className="h-8 w-8 text-slate-400 group-hover:scale-110 transition-transform" />
                  {prod.is_listed && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="success" className="shadow-xs">
                        <Check className="h-3 w-3 mr-1" /> In Your Shop
                      </Badge>
                    </div>
                  )}
                </div>

                {/* SKU Badge & Creator */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {prod.sku}
                  </span>
                  <span className="text-xs text-slate-400">
                    By {prod.creator?.name || "Admin"}
                  </span>
                </div>

                {/* Name */}
                <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                  {prod.name}
                </h4>

                {/* Global Description */}
                <p className="text-xs text-slate-500 line-clamp-2">
                  {prod.description || "No description provided."}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                {prod.is_listed ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-slate-600 cursor-default"
                    disabled
                  >
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Already Added
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => openAddModal(prod)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add to My Shop
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6 text-xs text-slate-500">
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

      {/* ADD EXISTING PRODUCT TO SHOP MODAL */}
      <Modal
        isOpen={!!selectedProductToAdd}
        onClose={() => setSelectedProductToAdd(null)}
        title={`Add to ${primaryShop?.name}`}
        description="Configure your shop-specific selling price and custom details. Global product record is not duplicated."
        maxWidth="md"
      >
        {addError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {addError}
          </div>
        )}

        {selectedProductToAdd && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-bold text-slate-900 block">{selectedProductToAdd.name}</span>
              <span className="font-mono text-slate-400 text-xs">{selectedProductToAdd.sku}</span>
              <p className="text-slate-600 mt-1 line-clamp-2">
                Fallback: {selectedProductToAdd.description || "No global description"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Shop Selling Price (৳ BDT) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 550.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400">
                Your shop sells at this price. Other shops can set different prices.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Custom Description (Optional)
              </label>
              <Textarea
                placeholder="Leave blank to use global product description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Custom Thumbnail URL (Optional)
              </label>
              <Input
                placeholder="Leave blank to use global product thumbnail"
                value={customThumbnail}
                onChange={(e) => setCustomThumbnail(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedProductToAdd(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => addMutation.mutate()}
                isLoading={addMutation.isPending}
                disabled={!sellingPrice || parseFloat(sellingPrice) <= 0}
              >
                Add Listing
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE NEW PRODUCT MODAL (Adds to Catalog & Shop) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create and list a new product"
        description="Creates a product in the shared catalog and immediately lists it in your shop within one transaction."
        maxWidth="lg"
      >
        {createError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {createError}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-800">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>
              This product will immediately become available in the shared catalog for other shop owners to discover.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Product Name *</label>
              <Input
                placeholder="e.g. Ergonomic Mouse Pad"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Unique SKU *</label>
              <Input
                placeholder="SKU-ACC-01"
                value={newProdSku}
                onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Global Product Description</label>
            <Textarea
              placeholder="Base description available to all shops..."
              value={newProdDesc}
              onChange={(e) => setNewProdDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Your Shop Listing Details ({primaryShop?.name})
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Your Selling Price (৳) *</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 750.00"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Custom Shop Description (optional)
              </label>
              <Textarea
                placeholder="Specific promotion or offer for your storefront..."
                value={newProdCustomDesc}
                onChange={(e) => setNewProdCustomDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              disabled={!newProdName || !newProdSku || !newProdPrice}
            >
              Create & List Product
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default function OwnerCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
