import { displaySerialNumber, type CertificatePrintItem } from "@/lib/types";

type CertificateTemplateProps = {
  certificate: CertificatePrintItem;
};

/**
 * Vakalat Nama certificate header layout.
 * Left: date, serial, QR. Center: Urdu heading. Right: empty.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  const [year, month, day] = certificate.issuedDate.split("-");
  const dated = `${day}-${month}-${year}`;
  const serialLabel = displaySerialNumber(certificate.serialNumber);

  return (
    <article className="certificate-sheet relative mx-auto flex min-h-[240mm] w-[210mm] flex-col overflow-hidden bg-[#f6c9ce] px-6 py-5 text-black shadow-[0_18px_40px_-28px_rgba(15,61,62,0.45)]">
      <header className="relative grid grid-cols-[1fr_1.4fr_1fr] items-start gap-3">
        <div dir="ltr" className="flex flex-col items-start gap-1 pt-1 text-left">
          <p className="font-[family-name:var(--font-body)] text-[13px] font-bold leading-tight tracking-wide">
            DATED: {dated}
          </p>
          <p className="font-[family-name:var(--font-body)] text-[13px] font-bold leading-tight tracking-wide">
            {serialLabel}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certificate.qrDataUrl}
            alt={`QR for ${serialLabel}`}
            className="mt-1 h-[72px] w-[72px] border border-black bg-transparent p-[2px]"
          />
        </div>

        <div
          lang="ur"
          dir="rtl"
          className="flex flex-col items-center justify-start pt-1 text-center font-[family-name:var(--font-urdu)]"
        >
          <h1 className="text-[32px] font-bold leading-relaxed text-black">
            وکالت نامہ
          </h1>
          <p className="mt-4 text-[16px] font-semibold leading-relaxed tracking-wide text-black">
            ڈسٹرکٹ بار ایسوسی ایشن، بہاول نگر
          </p>
        </div>

        <div aria-hidden="true" />
      </header>

      <div className="mt-8 flex-1" />
    </article>
  );
}
