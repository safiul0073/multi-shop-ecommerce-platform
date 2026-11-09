"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  allowedRole,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRole={allowedRole}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Header Bar */}
          <header className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 py-3 pl-16 pr-4 md:px-8">
            <div className="min-w-0">
              {title && <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>}
              {description && <p className="hidden sm:block text-sm text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </header>

          {/* Page Body */}
          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
