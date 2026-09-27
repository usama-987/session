import { NextResponse } from "next/server";
import { getSession } from "@/lib/store";

function unauthorized(message = "Unauthorized. Please sign in again.") {
  return {
    ok: false as const,
    response: NextResponse.json({ message }, { status: 401 }),
  };
}

export async function requireAuth(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return unauthorized();
  }

  const session = await getSession(token);
  if (!session) {
    return unauthorized("Session expired. Please sign in again.");
  }

  return { ok: true as const, token, session };
}

export async function requireAdminAuth(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;

  if (auth.session.role !== "admin") {
    return unauthorized("Admin access required.");
  }

  return auth;
}
