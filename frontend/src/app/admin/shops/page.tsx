"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { Shop, User } from "@/types";
import {
  Plus,
  Search,
  ExternalLink,
  Store,
  Trash2,
  Edit2,
  Eye,
  CheckCircle,
  XCircle,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function AdminShopsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [selectedShopDetail, setSelectedShopDetail] = useState<Shop | null>(null);
  const [deleteShopId, setDeleteShopId] = useState<number | null>(null);

  // Form state for creating a shop
  const [ownerMode, setOwnerMode] = useState<"existing" | "new">("existing");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerPassword, setNewOwnerPassword] = useState("");

  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopStatus, setShopStatus] = useState<"active" | "inactive">("active");
  const [formError, setFormError] = useState("");

  // Query shops list
  const { data: shopsData, isLoading } = useQuery({
    queryKey: ["admin", "shops", search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      const res = await api.get(`/admin/shops?${params.toString()}`);
      return res.data;
    },
  });

  // Query shop owners for dropdown
  const { data: ownersData } = useQuery({
    queryKey: ["admin", "shop-owners", "list"],
    queryFn: async () => {
      const res = await api.get("/admin/shop-owners?per_page=100");
      return res.data.data as User[];
    },
  });

  // Create Shop Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      setFormError("");
      const payload: Record<string, unknown> = {
        name: shopName,
        slug: shopSlug || undefined,
        description: shopDescription || undefined,
        contact_email: shopEmail || undefined,
        contact_phone: shopPhone || undefined,
        address: shopAddress || undefined,
        status: shopStatus,
      };

      if (ownerMode === "existing") {
        if (!selectedOwnerId) throw new Error("Please select an existing shop owner.");
        payload.owner_id = parseInt(selectedOwnerId);
      } else {
        if (!newOwnerName || !newOwnerEmail || !newOwnerPassword) {
          throw new Error("Please provide name, email, and password for the new owner.");
        }
        payload.new_owner = {
          name: newOwnerName,
          email: newOwnerEmail,
          password: newOwnerPassword,
        };
      }

      const res = await api.post("/admin/shops", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create shop.");
    },
  });

  // Update Shop Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editShop) return;
      const res = await api.put(`/admin/shops/${editShop.id}`, {
        name: shopName,
        slug: shopSlug,
        description: shopDescription,
        contact_email: shopEmail,
        contact_phone: shopPhone,
        address: shopAddress,
        status: shopStatus,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
      setEditShop(null);
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setFormError(err.response?.data?.message || "Failed to update shop.");
    },
  });

  // Delete Shop Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/shops/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDeleteShopId(null);
    },
  });

  const resetForm = () => {
    setShopName("");
    setShopSlug("");
    setShopDescription("");
    setShopEmail("");
    setShopPhone("");
    setShopAddress("");
    setShopStatus("active");
    setSelectedOwnerId("");
    setNewOwnerName("");
    setNewOwnerEmail("");
    setNewOwnerPassword("");
    setFormError("");
  };

  const openEdit = (shop: Shop) => {
    setEditShop(shop);
    setShopName(shop.name);
    setShopSlug(shop.slug);
    setShopDescription(shop.description || "");
    setShopEmail(shop.contact_email || "");
    setShopPhone(shop.contact_phone || "");
    setShopAddress(shop.address || "");
    setShopStatus(shop.status);
    setFormError("");
  };

  const shops: Shop[] = shopsData?.data || [];
  const meta = shopsData?.meta;

  return (
    <DashboardLayout
      allowedRole="admin"
      title="Shop Management"
      description="Manage merchant storefronts, tenant ownership, and storefront settings"
      actions={
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Shop
        </Button>
      }
    >
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search shops by name, slug, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Shops Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Shop</th>
                <th className="px-6 py-3.5">Owner</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Products</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading shops...</td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Store className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No shops found.</p>
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                          {shop.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{shop.name}</p>
                          <Link
                            href={`/store/${shop.slug}`}
                            target="_blank"
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium mt-0.5"
                          >
                            /store/{shop.slug} <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{shop.owner?.name || "Unassigned"}</p>
                      <p className="text-xs text-slate-400">{shop.owner?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={shop.status === "active" ? "success" : "destructive"}>
                        {shop.status === "active" ? (
                          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                        ) : (
                          <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Inactive</span>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                        <Layers className="h-3.5 w-3.5 text-slate-500" />
                        {shop.products_count} listings
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(shop.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedShopDetail(shop)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(shop)}
                          title="Edit Shop"
                        >
                          <Edit2 className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteShopId(shop.id)}
                          title="Delete Shop"
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
              Showing Page {meta.current_page} of {meta.last_page} ({meta.total} total shops)
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

      {/* CREATE SHOP MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Shop"
        description="Provision a storefront and assign to an existing merchant or register a new owner"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          {/* Owner Assignment Mode */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Shop Owner Assignment
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="ownerMode"
                  checked={ownerMode === "existing"}
                  onChange={() => setOwnerMode("existing")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Existing Owner
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="ownerMode"
                  checked={ownerMode === "new"}
                  onChange={() => setOwnerMode("new")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Register New Owner Account
              </label>
            </div>

            {ownerMode === "existing" ? (
              <div>
                <select
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Existing Merchant --</option>
                  {(ownersData || []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <Input
                  placeholder="Owner Name"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                />
                <Input
                  placeholder="Owner Email"
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newOwnerPassword}
                  onChange={(e) => setNewOwnerPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Shop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Shop Name *</label>
              <Input
                placeholder="e.g. Urban Style Store"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Custom Slug (optional)</label>
              <Input
                placeholder="urban-style-store"
                value={shopSlug}
                onChange={(e) => setShopSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Description</label>
            <Textarea
              placeholder="Tell customers about this shop..."
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Contact Email</label>
              <Input
                type="email"
                placeholder="shop@example.com"
                value={shopEmail}
                onChange={(e) => setShopEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Contact Phone</label>
              <Input
                placeholder="+880 1711 000000"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Physical Address</label>
              <Input
                placeholder="City, District"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={shopStatus}
                onChange={(e) => setShopStatus(e.target.value as "active" | "inactive")}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>
              Create Shop
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT SHOP MODAL */}
      <Modal
        isOpen={!!editShop}
        onClose={() => setEditShop(null)}
        title={`Edit Shop: ${editShop?.name}`}
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Shop Name</label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Slug</label>
              <Input value={shopSlug} onChange={(e) => setShopSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Description</label>
            <Textarea
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Contact Email</label>
              <Input value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Phone</label>
              <Input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Address</label>
              <Input value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={shopStatus}
                onChange={(e) => setShopStatus(e.target.value as "active" | "inactive")}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditShop(null)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <Modal
        isOpen={!!deleteShopId}
        onClose={() => setDeleteShopId(null)}
        title="Confirm Deletion"
        description="Are you sure you want to remove this shop? This will disable its storefront."
        maxWidth="sm"
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setDeleteShopId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteShopId && deleteMutation.mutate(deleteShopId)}
            isLoading={deleteMutation.isPending}
          >
            Delete Shop
          </Button>
        </div>
      </Modal>

      {/* SHOP DETAILS MODAL */}
      <Modal
        isOpen={!!selectedShopDetail}
        onClose={() => setSelectedShopDetail(null)}
        title={`Shop Overview: ${selectedShopDetail?.name}`}
        maxWidth="xl"
      >
        {selectedShopDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400">Assigned Merchant</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {selectedShopDetail.owner?.name}
                </p>
                <p className="text-slate-500">{selectedShopDetail.owner?.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Public Storefront URL</p>
                <Link
                  href={`/store/${selectedShopDetail.slug}`}
                  target="_blank"
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  /store/{selectedShopDetail.slug} <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div>
              <p className="text-slate-400">Description</p>
              <p className="text-slate-700 mt-1">{selectedShopDetail.description || "None provided"}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Contact Phone</span>
                <span className="font-medium text-slate-800">{selectedShopDetail.contact_phone || "-"}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Contact Email</span>
                <span className="font-medium text-slate-800">{selectedShopDetail.contact_email || "-"}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Total Listings</span>
                <span className="font-semibold text-indigo-600">{selectedShopDetail.products_count} Products</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
