import type { Metadata } from "next";
import { CertificateVerifyResult } from "@/components/common/CertificateVerifyResult";
import { displaySerialNumber } from "@/lib/types";
import { getCertificateBySerial } from "@/lib/store";

export const metadata: Metadata = {
  title: "Verify Certificate | Session",
  description: "Verify a printed Vakalat Nama certificate by serial number.",
};

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const certificate = await getCertificateBySerial(serial);
  const serialLabel = displaySerialNumber(
    certificate?.serialNumber || serial,
  );

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div className="login-backdrop" aria-hidden="true" />

      <section className="relative z-10 flex w-full max-w-md flex-col items-center">
        <p className="mb-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--brand)]">
          Session
        </p>

        <CertificateVerifyResult
          serialLabel={serialLabel}
          valid={Boolean(certificate)}
          issuedDate={certificate?.issuedDate}
          printedByName={certificate?.printedByName}
        />
      </section>
    </main>
  );
}
