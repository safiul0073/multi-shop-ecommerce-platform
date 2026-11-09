"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Store,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              M
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight">MultiShop</span>
              <span className="text-[10px] block font-semibold text-indigo-600 uppercase tracking-wider">
                Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="default" className="gap-2">
                Sign In to Console <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Layers className="h-3.5 w-3.5" /> Centralized Shared Product Catalog Architecture
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          One Global Catalog. <br className="hidden sm:inline" />
          <span className="text-indigo-600">Unlimited Independent Shops.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A production-grade multi-tenant e-commerce platform. Administrators and merchants share a single
          central product repository while independently setting custom prices, descriptions, and media.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="gap-2 shadow-md">
              Access Merchant / Admin Console <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/store/fashion-house">
            <Button size="lg" variant="outline" className="gap-2 bg-white">
              <Store className="h-4 w-4 text-purple-600" /> Explore Fashion House Storefront
            </Button>
          </Link>
        </div>
      </section>

      {/* Live Storefront Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Experience Live Storefronts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Notice how the same global product is listed with different prices and descriptions in each shop
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shop 1: Fashion House */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xl">
                  F
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Fashion House</h3>
                  <p className="text-xs text-slate-500">Slug: fashion-house</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Active Store
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-6">
              Curated contemporary fashion, premium denim, handcrafted leather, and luxury accessories.
            </p>

            <Link href="/store/fashion-house">
              <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                Visit Storefront <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Shop 2: Tech Store */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xl">
                  T
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Tech Store</h3>
                  <p className="text-xs text-slate-500">Slug: tech-store</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Active Store
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-6">
              Next-generation electronics, mechanical computing gear, audiophile headphones, and smart devices.
            </p>

            <Link href="/store/tech-store">
              <Button className="w-full gap-2 bg-sky-600 hover:bg-sky-700">
                Visit Storefront <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Shared Global Catalog</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Products created by admins or shop owners reside centrally in the shared repository without duplication.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Independent Shop Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each merchant sets independent selling prices, promotional descriptions, and thumbnails with automatic global fallbacks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Strict Cross-Shop Isolation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customers only see active listings assigned to the requested shop. Backend policies enforce tenant boundary security.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400">
        <p>Multi-Shop E-Commerce Management Platform • Laravel 13 + Next.js 15 + MySQL 8</p>
      </footer>
    </div>
  );
}
