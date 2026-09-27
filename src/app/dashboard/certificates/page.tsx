"use client";

import { useEffect, useState } from "react";
import { CertificatePrintPanel } from "@/components/common/CertificatePrintPanel";
import { apiFetch } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

export default function AdminCertificatesPage() {
  const [totalPrinted, setTotalPrinted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getAuthUser();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch("/api/certificates/stats");
        const data = (await response.json()) as {
          totalPrintCertificates?: number;
          message?: string;
        };

        if (!response.ok) {
          setError(data.message || "Unable to load certificate stats.");
          return;
        }

        setTotalPrinted(data.totalPrintCertificates ?? 0);
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
            Welcome{user?.name ? `, ${user.name}` : ""}. Certificates print
            under your admin account.
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
            initialTotal={totalPrinted}
            onPrinted={setTotalPrinted}
          />
        )}
      </div>
    </main>
  );
}
