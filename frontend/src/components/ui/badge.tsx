import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
        secondary: "bg-slate-50 text-slate-600 ring-slate-500/15",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
        destructive: "bg-rose-50 text-rose-700 ring-rose-600/15",
        outline: "bg-white text-slate-700 ring-slate-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </div>
  );
}

/** Active / inactive status pill used across tables. */
function StatusBadge({ status }: { status?: string }) {
  const active = status === "active";
  return (
    <Badge variant={active ? "success" : "secondary"} dot>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };
