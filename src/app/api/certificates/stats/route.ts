import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getPrintedCountForAccount } from "@/lib/store";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const certificatesPrinted = await getPrintedCountForAccount({
      id: auth.session.userId || auth.session.role,
      name: auth.session.name,
      email: auth.session.email,
      role: auth.session.role,
    });

    return NextResponse.json({
      totalPrintCertificates: certificatesPrinted,
      certificatesPrinted,
      user: {
        name: auth.session.name,
        email: auth.session.email,
        role: auth.session.role,
        certificatesPrinted,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load stats.";
    return NextResponse.json({ message }, { status: 404 });
  }
}
