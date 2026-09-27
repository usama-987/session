"use client";

import { useEffect, useState } from "react";
import { CertificatePrintPanel } from "@/components/common/CertificatePrintPanel";
import { apiFetch } from "@/lib/api-client";
import type { PublicStaffUser } from "@/lib/types";

export default function AdminCertificatesPage() {
  const [users, setUsers] = useState<PublicStaffUser[]>([]);
  const [totalPrinted, setTotalPrinted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError("");

      try {
        const [usersRes, statsRes] = await Promise.all([
          apiFetch("/api/users"),
          apiFetch("/api/certificates/stats"),
        ]);

        const usersData = (await usersRes.json()) as {
          users?: PublicStaffUser[];
          message?: string;
        };
        const statsData = (await statsRes.json()) as {
          totalPrintCertificates?: number;
          message?: string;
        };

        if (!usersRes.ok) {
          setError(usersData.message || "Unable to load users.");
          return;
        }

        if (!statsRes.ok) {
          setError(statsData.message || "Unable to load certificate stats.");
          return;
        }

        setUsers(usersData.users ?? []);
        setTotalPrinted(statsData.totalPrintCertificates ?? 0);
      } catch {
        setError("Unable to reach the server. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="print-backdrop" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            Certificates
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Select a user, choose how many certificates to print, then print the
            batch.
          </p>
        </header>

        {error ? (
          <p className="mb-6 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading print studio...</p>
        ) : (
          <CertificatePrintPanel
            mode="admin"
            staffOptions={users.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
            }))}
            initialTotal={totalPrinted}
            onPrinted={setTotalPrinted}
          />
        )}
      </div>
    </main>
  );
}
