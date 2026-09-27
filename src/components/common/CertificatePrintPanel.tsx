"use client";

import { useEffect, useMemo, useState } from "react";
import { CertificatePreview } from "@/components/common/CertificatePreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/api-client";
import type { CertificatePrintItem } from "@/lib/types";

const QUICK_AMOUNTS = [1, 5, 10, 25, 50];

type StaffOption = {
  id: string;
  name: string;
  email: string;
};

type CertificatePrintPanelProps = {
  mode: "staff" | "admin";
  staffOptions?: StaffOption[];
  initialTotal?: number;
  onPrinted?: (total: number) => void;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CertificatePrintPanel({
  mode,
  staffOptions = [],
  initialTotal = 0,
  onPrinted,
}: CertificatePrintPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [issuedDate, setIssuedDate] = useState(todayInputValue);
  const [selectedUserId, setSelectedUserId] = useState(
    staffOptions[0]?.id ?? "",
  );
  const [totalPrinted, setTotalPrinted] = useState(initialTotal);
  const [certificates, setCertificates] = useState<CertificatePrintItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setTotalPrinted(initialTotal);
  }, [initialTotal]);

  useEffect(() => {
    if (!selectedUserId && staffOptions[0]?.id) {
      setSelectedUserId(staffOptions[0].id);
    }
  }, [selectedUserId, staffOptions]);

  const selectedUser = useMemo(
    () => staffOptions.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, staffOptions],
  );

  async function handlePrint() {
    setError("");
    setSuccess("");

    if (quantity < 1 || quantity > 100) {
      setError("Choose between 1 and 100 certificates.");
      return;
    }

    if (!issuedDate) {
      setError("Please select a certificate date.");
      return;
    }

    if (mode === "admin" && !selectedUserId) {
      setError("Select a user to print certificates for.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/api/certificates/print", {
        method: "POST",
        body: JSON.stringify({
          quantity,
          issuedDate,
          userId: mode === "admin" ? selectedUserId : undefined,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        certificatesPrinted?: number;
        quantity?: number;
        certificates?: CertificatePrintItem[];
      };

      if (!response.ok) {
        setError(data.message || "Unable to print certificates.");
        return;
      }

      const nextTotal = data.certificatesPrinted ?? totalPrinted + quantity;
      setTotalPrinted(nextTotal);
      onPrinted?.(nextTotal);
      setCertificates(data.certificates ?? []);
      setSuccess(
        data.message ||
          `${quantity} certificate${quantity === 1 ? "" : "s"} ready to print.`,
      );

      window.setTimeout(() => {
        document
          .getElementById("certificate-preview")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_24px_60px_-36px_rgba(15,61,62,0.55)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(31,111,112,0.16), transparent 42%), radial-gradient(circle at bottom left, rgba(15,61,62,0.1), transparent 40%)",
          }}
        />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Certificate Studio
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--brand)] sm:text-4xl">
              Generate printable certificates
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
              Set the date, choose quantity, then generate certificates with
              unique serial numbers and QR codes ready for browser print.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-sm">
              <div className="rounded-2xl border border-[var(--border)] bg-[#f7fbfa] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  This batch
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--brand)]">
                  {quantity}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[#f7fbfa] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Total printed
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--brand)]">
                  {totalPrinted}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-5 backdrop-blur-sm sm:p-6">
            {mode === "admin" ? (
              <div className="mb-5">
                <Label htmlFor="print-user">Print for user</Label>
                <Select
                  id="print-user"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                >
                  {staffOptions.length === 0 ? (
                    <option value="">No users available</option>
                  ) : (
                    staffOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))
                  )}
                </Select>
                {selectedUser ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Selected: {selectedUser.name}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mb-5">
              <Label htmlFor="issued-date">Certificate date</Label>
              <Input
                id="issued-date"
                type="date"
                value={issuedDate}
                onChange={(event) => setIssuedDate(event.target.value)}
                required
              />
              <p className="mt-2 text-xs text-[var(--muted)]">
                This date will appear on every certificate in this batch.
              </p>
            </div>

            <div>
              <Label>How many to print</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((amount) => {
                  const active = !customMode && quantity === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setCustomMode(false);
                        setQuantity(amount);
                      }}
                      className={`min-w-14 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-[var(--brand)] text-white"
                          : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      }`}
                    >
                      {amount}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    customMode
                      ? "bg-[var(--brand)] text-white"
                      : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {customMode ? (
              <div className="mt-4">
                <Label htmlFor="custom-quantity">Custom amount (1–100)</Label>
                <Input
                  id="custom-quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Number(event.target.value) || 1)
                  }
                />
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="mt-4 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
                {success}
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-6 w-full"
              loading={loading}
              loadingText="Generating..."
              onClick={() => void handlePrint()}
              disabled={mode === "admin" && staffOptions.length === 0}
            >
              Generate {quantity} certificate{quantity === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </section>

      <div id="certificate-preview">
        <CertificatePreview
          certificates={certificates}
          onClose={() => setCertificates([])}
        />
      </div>
    </>
  );
}
