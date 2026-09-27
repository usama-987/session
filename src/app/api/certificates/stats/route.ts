import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getDashboardStats,
  getUserByEmail,
  getUserById,
} from "@/lib/store";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  if (auth.session.role === "admin") {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  }

  const user =
    (auth.session.userId
      ? await getUserById(auth.session.userId)
      : null) ?? (await getUserByEmail(auth.session.email));

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    totalPersons: 1,
    totalPrintCertificates: user.certificatesPrinted,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      certificatesPrinted: user.certificatesPrinted,
    },
  });
}
