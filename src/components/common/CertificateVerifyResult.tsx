type CertificateVerifyResultProps = {
  serialLabel: string;
  valid: boolean;
  issuedDate?: string;
  printedByName?: string;
};

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}

export function CertificateVerifyResult({
  serialLabel,
  valid,
  issuedDate,
  printedByName,
}: CertificateVerifyResultProps) {
  return (
    <article className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white/95 p-6 shadow-[0_20px_50px_-28px_rgba(15,61,62,0.45)] backdrop-blur-sm sm:p-8">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
          valid
            ? "bg-[var(--success-soft)] text-[var(--success)]"
            : "bg-[var(--danger-soft)] text-[var(--danger)]"
        }`}
      >
        {valid ? "Certificate verified" : "Not found"}
      </div>

      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--brand)]">
        {valid ? "Authentic Vakalat Nama" : "Invalid certificate"}
      </h1>

      <p className="mt-2 text-sm text-[var(--muted)]">
        {valid
          ? "This serial number matches an officially printed certificate."
          : "No printed certificate was found for this serial number."}
      </p>

      <dl className="mt-6 space-y-4 border-t border-[var(--border)] pt-5">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Serial
          </dt>
          <dd className="mt-1 text-base font-semibold text-[var(--foreground)]">
            {serialLabel}
          </dd>
        </div>

        {valid && issuedDate ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Issued date
            </dt>
            <dd className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {formatDisplayDate(issuedDate)}
            </dd>
          </div>
        ) : null}

        {valid && printedByName ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Printed by
            </dt>
            <dd className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {printedByName}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
