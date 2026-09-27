"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CertificateTemplate } from "@/components/common/CertificateTemplate";
import type { CertificatePrintItem } from "@/lib/types";

type CertificatePreviewProps = {
  certificates: CertificatePrintItem[];
  onClose?: () => void;
  onConfirmPrint?: () => Promise<void> | void;
};

export function CertificatePreview({
  certificates,
  onClose,
  onConfirmPrint,
}: CertificatePreviewProps) {
  const [printing, setPrinting] = useState(false);

  if (certificates.length === 0) return null;

  async function handlePrint() {
    if (!onConfirmPrint) {
      window.print();
      return;
    }

    setPrinting(true);
    try {
      await onConfirmPrint();
    } finally {
      setPrinting(false);
    }
  }

  return (
    <section className="certificate-preview mt-8 rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[0_24px_60px_-36px_rgba(15,61,62,0.45)] sm:p-6">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Certificate preview
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {certificates.length} certificate
            {certificates.length === 1 ? "" : "s"} in preview. Serial numbers
            are counted only after you print.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              className="border border-[var(--border)]"
              onClick={onClose}
              disabled={printing}
            >
              Close preview
            </Button>
          ) : null}
          <Button
            type="button"
            loading={printing}
            loadingText="Saving & printing..."
            onClick={() => void handlePrint()}
          >
            Print certificates
          </Button>
        </div>
      </div>

      <div className="certificate-print-area space-y-8">
        {certificates.map((certificate) => (
          <CertificateTemplate
            key={certificate.id}
            certificate={certificate}
          />
        ))}
      </div>
    </section>
  );
}
