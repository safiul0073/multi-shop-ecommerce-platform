"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Store, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/owner/dashboard");
      }
    } else {
      setErrorMessage(result.message || "Failed to sign in");
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">MultiShop Platform</h1>
          <p className="text-sm text-slate-500">Shared Catalog E-Commerce Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200/80 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to access the console</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Logins Box */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                One-Click Demo Credentials
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@example.com")}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/70 hover:border-indigo-200 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900">
                        Administrator
                      </p>
                      <p className="text-[11px] text-slate-500">admin@example.com</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-600">Select</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("owner1@example.com")}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/70 hover:border-indigo-200 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-purple-100 text-purple-700">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900">
                        Fashion House Owner
                      </p>
                      <p className="text-[11px] text-slate-500">owner1@example.com</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-600">Select</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("owner2@example.com")}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/70 hover:border-indigo-200 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-sky-100 text-sky-700">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900">
                        Tech Store Owner
                      </p>
                      <p className="text-[11px] text-slate-500">owner2@example.com</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-600">Select</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Storefront Direct Links */}
        <div className="text-center text-xs text-slate-500">
          Looking for customer storefronts?{" "}
          <Link href="/store/fashion-house" className="text-indigo-600 font-medium hover:underline">
            Fashion House
          </Link>{" "}
          or{" "}
          <Link href="/store/tech-store" className="text-indigo-600 font-medium hover:underline">
            Tech Store
          </Link>
        </div>
      </div>
    </div>
  );
}
