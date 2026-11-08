"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Compass,
  Boxes,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, primaryShop, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = role === "admin";

  const adminNav = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Shops", href: "/admin/shops", icon: Store },
    { name: "Catalog Products", href: "/admin/products", icon: Package },
    { name: "Shop Owners", href: "/admin/shop-owners", icon: Users },
  ];

  const ownerNav = [
    { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Browse Catalog", href: "/owner/catalog", icon: Compass },
    { name: "My Products", href: "/owner/my-products", icon: Boxes },
    { name: "Shop Settings", href: "/owner/settings", icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : ownerNav;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg bg-white p-2 border border-slate-200 shadow-sm text-slate-700"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <Link href={isAdmin ? "/admin/dashboard" : "/owner/dashboard"} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
              M
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">MultiShop</span>
              <span className="text-[10px] block font-medium uppercase tracking-wider text-indigo-600">
                {isAdmin ? "Admin Console" : "Owner Portal"}
              </span>
            </div>
          </Link>
        </div>

        {/* Current Active Shop Info (For Shop Owners) */}
        {!isAdmin && primaryShop && (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 truncate">{primaryShop.name}</span>
              <Link
                href={`/store/${primaryShop.slug}`}
                target="_blank"
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-medium"
              >
                Store <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">/store/{primaryShop.slug}</p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-xs shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-indigo-600" />
                  <span className="capitalize">{user?.role?.replace("_", " ")}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
