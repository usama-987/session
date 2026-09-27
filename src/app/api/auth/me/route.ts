import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    user: {
      name: auth.session.name,
      email: auth.session.email,
      role: auth.session.role,
    },
  });
}
