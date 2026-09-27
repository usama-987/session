import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api-auth";
import { createUser, getDirectoryUsers, toPublicUser } from "@/lib/store";
import type { UserRole } from "@/lib/types";

const ALLOWED_ROLES: UserRole[] = ["print_certificates"];

export async function GET(request: Request) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const users = await getDirectoryUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role as UserRole | undefined;

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { message: "Name, email, password, and role are required." },
      { status: 400 },
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json(
      { message: "Invalid role selected." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  try {
    const user = await createUser({ name, email, password, role });
    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: toPublicUser(user),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
