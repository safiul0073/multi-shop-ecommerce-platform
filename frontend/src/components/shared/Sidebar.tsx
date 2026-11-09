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
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, primaryShop, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = role === "admin";

  const sections = isAdmin
    ? [
        { label: "Overview", items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }] },
        {
          label: "Manage",
          items: [
            { name: "Shops", href: "/admin/shops", icon: Store },
            { name: "Catalog", href: "/admin/products", icon: Package },
            { name: "Shop owners", href: "/admin/shop-owners", icon: Users },
          ],
        },
      ]
    : [
        { label: "Overview", items: [{ name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard }] },
        {
          label: "Products",
          items: [
            { name: "Browse catalog", href: "/owner/catalog", icon: Compass },
            { name: "My products", href: "/owner/my-products", icon: Boxes },
          ],
        },
        { label: "Shop", items: [{ name: "Settings", href: "/owner/settings", icon: Settings }] },
      ];

  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        className="md:hidden fixed top-3.5 left-4 z-40 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-xs"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/30 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-5">
          <Link href={isAdmin ? "/admin/dashboard" : "/owner/dashboard"} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Store className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">MultiShop</p>
              <p className="text-xs text-slate-500">{isAdmin ? "Admin console" : "Owner portal"}</p>
            </div>
          </Link>
        </div>

        {!isAdmin && primaryShop && (
          <div className="mx-3 mb-2 rounded-lg border border-slate-200 px-3 py-2.5">
            <p className="text-xs text-slate-500">Current shop</p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-slate-900">{primaryShop.name}</span>
              <Link
                href={`/store/${primaryShop.slug}`}
                target="_blank"
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {sections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-3 pb-1.5 text-xs font-medium text-slate-400">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-slate-100 font-medium text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-indigo-600" />}
                      <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{isAdmin ? "Administrator" : "Shop owner"}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
