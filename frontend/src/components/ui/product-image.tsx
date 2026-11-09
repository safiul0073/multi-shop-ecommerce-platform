"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}

/** Product/shop photo with a neutral fallback when missing, a placeholder SVG, or broken. */
export function ProductImage({ src, alt, className, iconClassName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const usable = src && !src.endsWith("placeholder.svg") && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {usable ? (
        // eslint-disable-next-line @next/next/no-img-element -- images come from the API host
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Package className={cn("h-1/3 w-1/3 max-h-10 max-w-10 text-slate-300", iconClassName)} />
        </div>
      )}
    </div>
  );
}
