import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { attachQrCodes } from "@/lib/certificates";
import { recordCertificatePrint } from "@/lib/store";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: {
    userId?: string;
    email?: string;
    quantity?: number;
    issuedDate?: string;
  };

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

  let target = {
    userId: body.userId,
    email: body.email,
  };

  if (auth.session.role === "print_certificates") {
    target = {
      userId: auth.session.userId,
      email: auth.session.email,
    };
  }

  if (!target.userId && !target.email) {
    return NextResponse.json(
      { message: "userId or email is required." },
      { status: 400 },
    );
  }

  try {
    const { user, certificates } = await recordCertificatePrint({
      ...target,
      quantity,
      issuedDate: body.issuedDate,
    });

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
      message: `${quantity} certificate${quantity === 1 ? "" : "s"} ready to print.`,
      quantity,
      certificatesPrinted: user.certificatesPrinted,
      certificates: printItems,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record print.";
    const status = message.includes("not found")
      ? 404
      : message.includes("not allowed")
        ? 403
        : 400;
    return NextResponse.json({ message }, { status });
  }
}
