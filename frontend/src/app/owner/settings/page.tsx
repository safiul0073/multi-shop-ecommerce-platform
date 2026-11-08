"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Save, CheckCircle2 } from "lucide-react";

export default function OwnerSettingsPage() {
  const queryClient = useQueryClient();
  const { primaryShop, setPrimaryShop } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: shopData } = useQuery({
    queryKey: ["owner", "shop", primaryShop?.id],
    enabled: !!primaryShop?.id,
    queryFn: async () => {
      const res = await api.get(`/owner/shops/${primaryShop?.id}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (shopData) {
      setName(shopData.name || "");
      setDescription(shopData.description || "");
      setContactEmail(shopData.contact_email || "");
      setContactPhone(shopData.contact_phone || "");
      setAddress(shopData.address || "");
    }
  }, [shopData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!primaryShop) return;
      setSuccessMessage("");
      setErrorMessage("");
      const res = await api.put(`/owner/shops/${primaryShop.id}`, {
        name,
        description,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage("Shop settings saved successfully.");
      if (data.data) {
        setPrimaryShop(data.data);
      }
      queryClient.invalidateQueries({ queryKey: ["owner", "shop"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "dashboard"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setErrorMessage(err.response?.data?.message || "Failed to update shop settings.");
    },
  });

  return (
    <DashboardLayout
      allowedRole="shop_owner"
      title="Storefront Settings"
      description="Configure public branding, customer contact details, and location for your storefront"
    >
      <div className="max-w-3xl space-y-6">
        {successMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
            {errorMessage}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <Store className="h-5 w-5 text-indigo-600" />
              <div>
                <CardTitle>Branding & Profile</CardTitle>
                <CardDescription>Visible to customers visiting your storefront</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Shop Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Storefront Bio / Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="A brief introduction to your shop..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
            <CardDescription>Customer support channels displayed in your storefront header</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Customer Support Email</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="support@yourshop.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Contact Phone Number</label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+880 1711 000000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Physical Store Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House 12, Road 4, Banani, Dhaka"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => updateMutation.mutate()}
            isLoading={updateMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
