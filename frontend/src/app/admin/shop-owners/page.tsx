"use client";

import { toast } from "sonner";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { User, Shop } from "@/types";
import {
  Plus,
  Search,
  Users,
  Edit2,
  KeyRound,
  Store,
  Eye,
} from "lucide-react";

export default function AdminShopOwnersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [viewUserDetail, setViewUserDetail] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { data: ownersData, isLoading } = useQuery({
    queryKey: ["admin", "shop-owners", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      const res = await api.get(`/admin/shop-owners?${params.toString()}`);
      return res.data;
    },
  });

  const { data: ownerShopsData } = useQuery({
    queryKey: ["admin", "owner-detail", viewUserDetail?.id],
    enabled: !!viewUserDetail,
    queryFn: async () => {
      const res = await api.get(`/admin/shop-owners/${viewUserDetail?.id}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      setFormError("");
      const res = await api.post("/admin/shop-owners", {
        name,
        email,
        password,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Shop owner created");
      queryClient.invalidateQueries({ queryKey: ["admin", "shop-owners"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create shop owner.");
      toast.error(err.response?.data?.message || err.message || "Failed to create shop owner.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editUser) return;
      setFormError("");
      const res = await api.put(`/admin/shop-owners/${editUser.id}`, {
        name,
        email,
        password: password || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Shop owner updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "shop-owners"] });
      setEditUser(null);
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setFormError(err.response?.data?.message || "Failed to update shop owner.");
      toast.error(err.response?.data?.message || "Failed to update shop owner.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!resetUser) return;
      setFormError("");
      const res = await api.post(`/admin/shop-owners/${resetUser.id}/reset-password`, {
        password,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password reset");
      setResetUser(null);
      setPassword("");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setFormError(err.response?.data?.message || "Failed to reset password.");
      toast.error(err.response?.data?.message || "Failed to reset password.");
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setFormError("");
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setFormError("");
  };

  const openReset = (user: User) => {
    setResetUser(user);
    setPassword("");
    setFormError("");
  };

  const owners: User[] = ownersData?.data || [];
  const meta = ownersData?.meta;

  return (
    <DashboardLayout
      allowedRole="admin"
      title="Shop owners"
      description="Accounts that can sign in and manage shops"
      actions={
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New shop owner
        </Button>
      }
    >
      <div className="flex gap-3 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search owners by name, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 font-medium">Shop owner</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Owned Shops</th>
                <th className="px-6 py-3 font-medium">Registered</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-0"><TableSkeleton rows={4} /></td>
                </tr>
              ) : owners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No shop owners found.</p>
                  </td>
                </tr>
              ) : (
                owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                          {owner.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-slate-900">{owner.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{owner.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-xs font-semibold text-indigo-700">
                        <Store className="h-3.5 w-3.5 text-indigo-500" />
                        {owner.shops_count || 0} {owner.shops_count === 1 ? "Shop" : "Shops"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(owner.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon" className="group h-8 w-8"
                          onClick={() => setViewUserDetail(owner)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon" className="group h-8 w-8"
                          onClick={() => openEdit(owner)}
                          title="Edit Account"
                        >
                          <Edit2 className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon" className="group h-8 w-8"
                          onClick={() => openReset(owner)}
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
            <span>
              Page {meta.current_page} of {meta.last_page} ({meta.total} owners)
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

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New shop owner"
        description="Create an account so they can sign in and manage their shop"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Full Name *</label>
            <Input
              placeholder="e.g. Sara Rahman"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email Address *</label>
            <Input
              type="email"
              placeholder="owner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Temporary Password *</label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>
              Create shop owner
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit Shop Owner"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Change Password (optional)</label>
            <Input
              type="password"
              placeholder="Leave blank to preserve current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        title={`Reset Password: ${resetUser?.name}`}
        maxWidth="sm"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">New Password</label>
            <Input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setResetUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => resetMutation.mutate()}
              isLoading={resetMutation.isPending}
              disabled={password.length < 8}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!viewUserDetail}
        onClose={() => setViewUserDetail(null)}
        title={`${viewUserDetail?.name}`}
        maxWidth="md"
      >
        {viewUserDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-slate-400">Account Email</p>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewUserDetail.email}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Associated Shops ({ownerShopsData?.shops?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-56 overflow-y-auto">
                {!ownerShopsData?.shops || ownerShopsData.shops.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No shops assigned yet.</div>
                ) : (
                  ownerShopsData.shops.map((s: Shop) => (
                    <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-slate-400">/store/{s.slug}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 capitalize">
                        {s.status}
                      </span>
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
