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
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xs">
            <div>
              {title && <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>}
              {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>

          {/* Page Body */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
