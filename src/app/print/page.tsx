"use client";

import { useEffect, useState } from "react";
import { CertificatePrintPanel } from "@/components/common/CertificatePrintPanel";
import { apiFetch } from "@/lib/api-client";
import { getAuthUser } from "@/lib/auth";

export default function PrintPage() {
  const [totalPrinted, setTotalPrinted] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = getAuthUser();

  useEffect(() => {
    void (async () => {
      try {
        const response = await apiFetch("/api/certificates/stats");
        if (!response.ok) return;
        const data = (await response.json()) as {
          totalPrintCertificates?: number;
        };
        setTotalPrinted(data.totalPrintCertificates ?? 0);
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
            Welcome{user?.name ? `, ${user.name}` : ""}. Choose a quantity and
            print certificates for this session.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading print studio...</p>
        ) : (
          <CertificatePrintPanel
            mode="staff"
            initialTotal={totalPrinted}
            onPrinted={setTotalPrinted}
          />
        )}
      </div>
    </main>
  );
}
