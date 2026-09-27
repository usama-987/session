"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/api-client";
import { ROLE_OPTIONS, type UserRole } from "@/lib/types";

type CreateRoleUserFormProps = {
  onCreated?: () => void;
};

export function CreateRoleUserForm({ onCreated }: CreateRoleUserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("print_certificates");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "Unable to create account.");
        return;
      }

      setSuccess(data.message || "Account created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("print_certificates");
      onCreated?.();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-[var(--border)] bg-white p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Create credentials
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create an account and assign a role to print certificates.
        </p>
      </div>

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="role-email">Email</Label>
        <Input
          id="role-email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="role-password">Password</Label>
        <Input
          id="role-password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          id="role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          required
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
          {success}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full sm:w-auto"
        loading={loading}
        loadingText="Creating..."
      >
        Create account
      </Button>
    </form>
  );
}
