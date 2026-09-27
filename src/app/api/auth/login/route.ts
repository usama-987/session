import { NextResponse } from "next/server";
import {
  createSession,
  findStaffByCredentials,
} from "@/lib/store";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@session.com")
      .trim()
      .toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
    const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

    if (email === adminEmail && password === adminPassword) {
      const token = Buffer.from(
        `admin:${email}:${Date.now()}:${process.env.AUTH_SECRET ?? "session-secret"}`,
      ).toString("base64");

      const user = {
        name: adminName,
        email,
        role: "admin" as const,
      };

      await createSession({
        name: user.name,
        email: user.email,
        token,
        role: "admin",
      });

      return NextResponse.json({
        message: "Login successful.",
        token,
        user,
      });
    }

    const staff = await findStaffByCredentials(email, password);

    if (!staff) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = Buffer.from(
      `staff:${staff.id}:${Date.now()}:${process.env.AUTH_SECRET ?? "session-secret"}`,
    ).toString("base64");

    const user = {
      name: staff.name,
      email: staff.email,
      role: staff.role,
    };

    await createSession({
      name: user.name,
      email: user.email,
      token,
      role: user.role,
      userId: staff.id,
    });

    return NextResponse.json({
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in.";
    console.error("Login failed:", error);
    return NextResponse.json(
      {
        message: message.includes("DATABASE_URL")
          ? "Database is not configured on the server. Set DATABASE_URL in Vercel."
          : "Server error during login. Check DATABASE_URL and Neon connection.",
      },
      { status: 500 },
    );
  }
}
