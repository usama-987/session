import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api-auth";
import { deleteUser, toPublicUser, updateUser } from "@/lib/store";
import type { UserRole } from "@/lib/types";

const ALLOWED_ROLES: UserRole[] = ["print_certificates"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

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

  if (!name || !email || !role) {
    return NextResponse.json(
      { message: "Name, email, and role are required." },
      { status: 400 },
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json(
      { message: "Invalid role selected." },
      { status: 400 },
    );
  }

  if (password && password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  try {
    const user = await updateUser(id, {
      name,
      email,
      role,
      password: password || undefined,
    });

    return NextResponse.json({
      message: "User updated successfully.",
      user: toPublicUser(user),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update user.";
    const status = message.includes("not found")
      ? 404
      : message.includes("already exists")
        ? 409
        : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    await deleteUser(id);
    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete user.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
