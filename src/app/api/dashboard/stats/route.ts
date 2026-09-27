import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api-auth";
import { getDashboardStats } from "@/lib/store";

export async function GET(request: Request) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
