"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StorefrontShop } from "@/types";
import { ArrowRight, Layers, Store, ShieldCheck } from "lucide-react";

const FEATURED_SHOPS = ["fashion-house", "tech-store"];

const FEATURES = [
  {
    icon: Layers,
    title: "One shared catalog",
    body: "Products created by admins or shop owners live in a single catalog that every shop can list from.",
  },
  {
    icon: Store,
    title: "Shop-level pricing",
    body: "Each shop sets its own price, description and photo, falling back to the catalog defaults.",
  },
  {
    icon: ShieldCheck,
    title: "Customer isolation",
    body: "Customers only see active products assigned to the shop they are visiting.",
  },
];

export default function HomePage() {
  const shops = useQueries({
    queries: FEATURED_SHOPS.map((slug) => ({
      queryKey: ["storefront", "shop", slug],
      queryFn: async () => (await api.get(`/storefront/${slug}`)).data.data as StorefrontShop,
      retry: false,
    })),
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              M
            </div>
            <span className="font-semibold tracking-tight text-slate-900">MultiShop</span>
          </div>
          <Link href="/login">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          One catalog. Many independent shops.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Admins and shop owners share a single product catalog. Each shop lists what it wants and
          sets its own prices, details and photos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#shops">
            <Button size="lg" variant="outline">Browse shops</Button>
          </a>
        </div>
      </section>

      <section id="shops" className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Featured shops</h2>
        <p className="mt-1 text-sm text-slate-500">
          The same catalog product can appear in both shops at different prices.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {shops.map(({ data: shop, isLoading }, i) =>
            isLoading ? (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ) : shop ? (
              <Link
                key={shop.slug}
                href={`/store/${shop.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  {shop.banner && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shop.banner}
                      alt=""
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{shop.name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{shop.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
                </div>
              </Link>
            ) : null
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                <Icon className="h-4 w-4 text-slate-700" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        MultiShop · Laravel + Next.js
      </footer>
    </div>
  );
}
