"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Skip the initial mount
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-100 flex items-center justify-center bg-background/40 backdrop-blur-sm transition-opacity duration-200"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/90 px-8 py-6 shadow-lg backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
