import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { removeSession } from "@/lib/store";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  await removeSession(auth.token);

  return NextResponse.json({
    message: "Signed out successfully.",
  });
}
