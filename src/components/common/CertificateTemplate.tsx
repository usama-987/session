import type { CertificatePrintItem } from "@/lib/types";

type CertificateTemplateProps = {
  certificate: CertificatePrintItem;
};

/**
 * Urdu certificate layout.
 * Replace / restyle this component when the final design templates arrive.
 * Keep these fields available: serialNumber, issuedDate, qrDataUrl, printedByName.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  const formattedDate = new Date(
    `${certificate.issuedDate}T00:00:00`,
  ).toLocaleDateString("ur-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article
      lang="ur"
      dir="rtl"
      className="certificate-sheet relative mx-auto flex min-h-[240mm] w-[170mm] flex-col justify-between overflow-hidden rounded-[18px] border-[3px] border-[var(--brand)] bg-[#fffdf8] px-10 py-12 font-[family-name:var(--font-urdu)] text-[var(--brand)] shadow-[0_18px_40px_-28px_rgba(15,61,62,0.45)]"
    >
      <div
        className="pointer-events-none absolute inset-4 rounded-[14px] border border-[var(--accent)]/35"
        aria-hidden="true"
      />

      <header className="relative text-center">
        <p className="text-base font-semibold text-[var(--accent)]">
          سیشن سرٹیفکیٹ
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-relaxed tracking-tight sm:text-5xl">
          مکمل ہونے کا سرٹیفکیٹ
        </h2>
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">
          یہ عارضی سانچہ ہے — حتمی ڈیزائن بعد میں شامل کیا جائے گا۔
        </p>
      </header>

      <div className="relative mt-10 flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-base text-[var(--muted)]">سیریل نمبر</p>
        <p
          dir="ltr"
          className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide"
        >
          {certificate.serialNumber}
        </p>

        <p className="mt-8 text-base text-[var(--muted)]">تاریخ</p>
        <p className="mt-2 text-2xl font-semibold leading-relaxed">
          {formattedDate}
        </p>

        <p className="mt-8 max-w-sm text-base leading-9 text-[var(--muted)]">
          جاری کنندہ: {certificate.printedByName}۔ تصدیق کے لیے نیچے کیو آر کوڈ
          اسکین کریں۔
        </p>
      </div>

      <footer className="relative mt-10 flex items-end justify-between gap-6">
        <div className="text-right">
          <div className="ms-auto h-px w-40 bg-[var(--brand)]/40" />
          <p className="mt-2 text-sm text-[var(--muted)]">مجاز مہر</p>
        </div>

        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certificate.qrDataUrl}
            alt={`${certificate.serialNumber} کا کیو آر کوڈ`}
            className="mx-auto h-28 w-28 rounded-lg border border-[var(--border)] bg-white p-1"
          />
          <p className="mt-2 text-sm text-[var(--muted)]">
            تصدیق کے لیے اسکین کریں
          </p>
        </div>
      </footer>
    </article>
  );
}
