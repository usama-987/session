import QRCode from "qrcode";
import type { CertificatePrintItem } from "@/lib/types";

export async function buildCertificateQrDataUrl(payload: string) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180,
    color: {
      dark: "#000000",
      light: "#00000000",
    },
  });
}

export async function attachQrCodes(
  items: Omit<CertificatePrintItem, "qrDataUrl">[],
): Promise<CertificatePrintItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      qrDataUrl: await buildCertificateQrDataUrl(item.qrPayload),
    })),
  );
}
