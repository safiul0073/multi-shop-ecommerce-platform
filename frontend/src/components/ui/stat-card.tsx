import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: "indigo" | "emerald" | "amber" | "sky" | "rose";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "indigo",
}: StatCardProps) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={cn("rounded-lg p-2.5 border", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h4>
        {trend && <span className="text-xs font-medium text-emerald-600">{trend}</span>}
      </div>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  );
}
