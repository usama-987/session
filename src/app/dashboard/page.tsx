"use client";

import { useCallback, useEffect, useState } from "react";
import { AccountsList } from "@/components/common/AccountsList";
import { StatCard } from "@/components/ui/StatCard";
import { apiFetch } from "@/lib/api-client";

type Account = {
  id: string;
  name: string;
  email: string;
};

type Stats = {
  totalPersons: number;
  totalPrintCertificates: number;
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPersons: 0,
    totalPrintCertificates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, usersRes] = await Promise.all([
        apiFetch("/api/dashboard/stats"),
        apiFetch("/api/users"),
      ]);

      const statsData = (await statsRes.json()) as Stats & { message?: string };
      const usersData = (await usersRes.json()) as {
        users?: Account[];
        message?: string;
      };

      if (!statsRes.ok) {
        setError(statsData.message || "Unable to load dashboard stats.");
        return;
      }

      if (!usersRes.ok) {
        setError(usersData.message || "Unable to load accounts.");
        return;
      }

      setStats({
        totalPersons: statsData.totalPersons ?? 0,
        totalPrintCertificates: statsData.totalPrintCertificates ?? 0,
      });
      setAccounts(usersData.users ?? []);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Overview of accounts and printed certificates.
        </p>
      </header>

      {error ? (
        <p className="mb-6 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total persons"
          value={loading ? "—" : stats.totalPersons}
          hint="Accounts created by admin"
        />
        <StatCard
          label="Total print certificates"
          value={loading ? "—" : stats.totalPrintCertificates}
          hint="Certificates printed across all roles"
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Account details
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Name and email of people you created accounts for.
          </p>
        </div>
        <AccountsList accounts={accounts} loading={loading} />
      </section>
    </main>
  );
}
