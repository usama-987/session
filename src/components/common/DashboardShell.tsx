"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAuthToken, getAuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api-client";
import { ADMIN_NAV_ITEMS, Sidebar } from "@/components/common/Sidebar";
import { DashboardHeader } from "@/components/common/DashboardHeader";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const localUser = getAuthUser();

    if (!token) {
      router.replace("/");
      return;
    }

    if (localUser && localUser.role !== "admin") {
      router.replace("/print");
      return;
    }

    void (async () => {
      try {
        const response = await apiFetch("/api/auth/me");
        if (!response.ok) {
          clearAuthSession();
          router.replace("/");
          return;
        }

        const data = (await response.json()) as {
          user?: { role?: string };
        };

        if (data.user?.role !== "admin") {
          router.replace("/print");
          return;
        }

        setReady(true);
      } catch {
        clearAuthSession();
        router.replace("/");
      }
    })();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <Sidebar items={ADMIN_NAV_ITEMS} subtitle="Admin Panel" />
      <div className="flex min-h-full flex-1 flex-col bg-[var(--background)]">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
