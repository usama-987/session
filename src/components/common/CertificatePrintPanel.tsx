"use client";

import { useEffect, useState } from "react";
import { CertificatePreview } from "@/components/common/CertificatePreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { apiFetch } from "@/lib/api-client";
import type { CertificatePrintItem } from "@/lib/types";

const QUICK_AMOUNTS = [1, 5, 10, 25, 50];

type CertificatePrintPanelProps = {
  initialTotal?: number;
  onPrinted?: (total: number) => void;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CertificatePrintPanel({
  initialTotal = 0,
  onPrinted,
}: CertificatePrintPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [issuedDate, setIssuedDate] = useState(todayInputValue);
  const [totalPrinted, setTotalPrinted] = useState(initialTotal);
  const [certificates, setCertificates] = useState<CertificatePrintItem[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setTotalPrinted(initialTotal);
  }, [initialTotal]);

  function getRequestBody() {
    return { quantity, issuedDate };
  }

  function validateForm() {
    if (quantity < 1 || quantity > 100) {
      setError("Choose between 1 and 100 certificates.");
      return false;
    }

    if (!issuedDate) {
      setError("Please select a certificate date.");
      return false;
    }

    return true;
  }

  async function handleGenerate() {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await apiFetch("/api/certificates/preview", {
        method: "POST",
        body: JSON.stringify(getRequestBody()),
      });

      const data = (await response.json()) as {
        message?: string;
        certificates?: CertificatePrintItem[];
      };

      if (!response.ok) {
        setError(data.message || "Unable to generate preview.");
        return;
      }

      setCertificates(data.certificates ?? []);
      setIsDraft(true);
      setSuccess(
        data.message ||
          `${quantity} certificate${quantity === 1 ? "" : "s"} ready for preview.`,
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

  async function handleConfirmPrint() {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const response = await apiFetch("/api/certificates/print", {
      method: "POST",
      body: JSON.stringify(getRequestBody()),
    });

    const data = (await response.json()) as {
      message?: string;
      certificatesPrinted?: number;
      certificates?: CertificatePrintItem[];
    };

    if (!response.ok) {
      setError(data.message || "Unable to print certificates.");
      throw new Error(data.message || "Print failed");
    }

    const nextTotal = data.certificatesPrinted ?? totalPrinted + quantity;
    setTotalPrinted(nextTotal);
    onPrinted?.(nextTotal);
    setCertificates(data.certificates ?? []);
    setIsDraft(false);
    setSuccess(
      data.message ||
        `${quantity} certificate${quantity === 1 ? "" : "s"} printed successfully.`,
    );

    await new Promise((resolve) => window.setTimeout(resolve, 100));
    window.print();
  }

  function handleClosePreview() {
    setCertificates([]);
    setIsDraft(false);
    setSuccess("");
    setError("");
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
              Certificates are printed under your signed-in account. Serial
              numbers update only when you click Print certificates.
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
                  Your printed total
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--brand)]">
                  {totalPrinted}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-5 backdrop-blur-sm sm:p-6">
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
                {isDraft ? " (not counted yet)" : ""}
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-6 w-full"
              loading={loading}
              loadingText="Generating..."
              onClick={() => void handleGenerate()}
            >
              Generate {quantity} certificate{quantity === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </section>

      <div id="certificate-preview">
        <CertificatePreview
          certificates={certificates}
          onClose={handleClosePreview}
          onConfirmPrint={handleConfirmPrint}
        />
      </div>
    </>
  );
}
