export function getAppBaseUrl(request?: Request) {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");

    if (host) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }

    try {
      return new URL(request.url).origin;
    } catch {
      // fall through
    }
  }

  return "http://localhost:3000";
}

export function normalizeCertificateSerial(serial: string) {
  const digits = serial.replace(/\D/g, "");
  if (!digits) return serial.trim();
  return digits.padStart(9, "0");
}

export function buildCertificateVerifyUrl(
  serialNumber: string,
  baseUrl: string,
) {
  const serial = normalizeCertificateSerial(serialNumber);
  return `${baseUrl.replace(/\/$/, "")}/verify/${serial}`;
}
