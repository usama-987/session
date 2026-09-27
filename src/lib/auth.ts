import type { AuthRole } from "@/lib/types";

export type { AuthRole };

export type AuthUser = {
  name: string;
  email: string;
  role: AuthRole;
};

const TOKEN_KEY = "session_auth_token";
const USER_KEY = "session_auth_user";

export function saveAuthSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.email || !parsed.name) return null;
    return {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role ?? "admin",
    };
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Clear legacy keys from earlier versions.
  localStorage.removeItem("session_admin_token");
  localStorage.removeItem("session_admin_user");
}

/** @deprecated use clearAuthSession */
export function clearAuthToken() {
  clearAuthSession();
}

/** @deprecated use saveAuthSession */
export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}
