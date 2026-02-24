"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { LoginForm } from "@/components/login-form";

export default function HomePage() {
  const { isAuthenticated } = useFinance();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}
