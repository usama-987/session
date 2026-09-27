import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { attachQrCodes } from "@/lib/certificates";
import { previewCertificatePrint } from "@/lib/store";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: { quantity?: number; issuedDate?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const quantity = Number(body.quantity ?? 1);

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100) {
    return NextResponse.json(
      { message: "Quantity must be between 1 and 100." },
      { status: 400 },
    );
  }

  try {
    const { certificates, certificatesPrinted } = await previewCertificatePrint(
      {
        printer: {
          id: auth.session.userId || auth.session.role,
          name: auth.session.name,
          email: auth.session.email,
          role: auth.session.role,
        },
        quantity,
        issuedDate: body.issuedDate,
      },
    );

    const printItems = await attachQrCodes(
      certificates.map((certificate) => ({
        id: certificate.id,
        serialNumber: certificate.serialNumber,
        issuedDate: certificate.issuedDate,
        printedByName: certificate.printedByName,
        qrPayload: certificate.qrPayload,
      })),
    );

    return NextResponse.json({
      message: `${quantity} certificate${quantity === 1 ? "" : "s"} ready for preview.`,
      quantity,
      certificatesPrinted,
      certificates: printItems,
      draft: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create preview.";
    const status = message.includes("not found")
      ? 404
      : message.includes("not allowed")
        ? 403
        : 400;
    return NextResponse.json({ message }, { status });
  }
}
