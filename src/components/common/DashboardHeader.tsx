"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthUser,
  saveAuthSession,
  getAuthToken,
  type AuthUser,
} from "@/lib/auth";

export function DashboardHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await apiFetch("/api/auth/me");
        if (!response.ok) return;

        const data = (await response.json()) as { user?: AuthUser };
        if (!data.user) return;

        setUser(data.user);
        const token = getAuthToken();
        if (token) {
          saveAuthSession(token, data.user);
        }
      } catch {
        // Keep local user info if the request fails.
      }
    })();
  }, []);

  async function handleSignOut() {
    setLoading(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Still clear local session if the request fails.
    } finally {
      clearAuthSession();
      setLoading(false);
      router.replace("/");
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-[var(--border)] bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {user?.name || "Admin"}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">
            {user?.email || "Signed in"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
