import type { CertificatePrintItem } from "@/lib/types";

type CertificateTemplateProps = {
  certificate: CertificatePrintItem;
};

/**
 * Placeholder certificate layout.
 * Replace / restyle this component when the final design templates arrive.
 * Keep these fields available: serialNumber, issuedDate, qrDataUrl, printedByName.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  const formattedDate = new Date(`${certificate.issuedDate}T00:00:00`).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <article className="certificate-sheet relative mx-auto flex min-h-[240mm] w-[170mm] flex-col justify-between overflow-hidden rounded-[18px] border-[3px] border-[var(--brand)] bg-[#fffdf8] px-10 py-12 text-[var(--brand)] shadow-[0_18px_40px_-28px_rgba(15,61,62,0.45)]">
      <div
        className="pointer-events-none absolute inset-4 rounded-[14px] border border-[var(--accent)]/35"
        aria-hidden="true"
      />

      <header className="relative text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Session Certificate
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
          Certificate of Completion
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Template placeholder — design will be replaced with your artwork.
        </p>
      </header>

      <div className="relative mt-10 flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          Serial Number
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide">
          {certificate.serialNumber}
        </p>

        <p className="mt-8 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          Date
        </p>
        <p className="mt-2 text-xl font-semibold">{formattedDate}</p>

        <p className="mt-8 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Issued through {certificate.printedByName}. QR code below can be
          scanned to verify this certificate record.
        </p>
      </div>

      <footer className="relative mt-10 flex items-end justify-between gap-6">
        <div>
          <div className="h-px w-40 bg-[var(--brand)]/40" />
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Authorized Seal
          </p>
        </div>

        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certificate.qrDataUrl}
            alt={`QR code for ${certificate.serialNumber}`}
            className="mx-auto h-28 w-28 rounded-lg border border-[var(--border)] bg-white p-1"
          />
          <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Scan to verify
          </p>
        </div>
      </footer>
    </article>
  );
}
