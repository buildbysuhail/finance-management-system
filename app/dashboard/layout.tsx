"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { RouteProgress } from "@/components/route-progress";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useFinance();
  const router = useRouter();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true;
    }
  }, [isAuthenticated]);

  // Only redirect if user was previously authenticated and then logged out
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

 return (
  <div className="relative flex h-screen overflow-hidden bg-background">
    <div className="hidden md:block">
      <AppSidebar />
    </div>
    <div className="flex flex-1 flex-col overflow-hidden">
      <MobileHeader />
      <main className="relative flex-1 overflow-y-auto p-4 md:p-8">
        <RouteProgress />
        {children}
      </main>
    </div>
  </div>
);
}
