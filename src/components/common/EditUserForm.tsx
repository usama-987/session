"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/api-client";
import {
  ROLE_OPTIONS,
  type PublicStaffUser,
  type UserRole,
} from "@/lib/types";

type EditUserFormProps = {
  user: PublicStaffUser;
  onCancel: () => void;
  onUpdated: (user: PublicStaffUser) => void;
};

export function EditUserForm({ user, onCancel, onUpdated }: EditUserFormProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user.role);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setError("");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          role,
          password: password || undefined,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        user?: PublicStaffUser;
      };

      if (!response.ok || !data.user) {
        setError(data.message || "Unable to update user.");
        return;
      }

      onUpdated(data.user);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5 rounded-2xl border border-[var(--border)] bg-white p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Edit user
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Update account details. Leave password blank to keep the current one.
        </p>
      </div>

      <div>
        <Label htmlFor="edit-name">Full name</Label>
        <Input
          id="edit-name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-password">New password (optional)</Label>
        <PasswordInput
          id="edit-password"
          name="password"
          placeholder="Leave blank to keep current password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
        />
      </div>

      <div>
        <Label htmlFor="edit-role">Role</Label>
        <Select
          id="edit-role"
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

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          className="w-full sm:w-auto"
          loading={loading}
          loadingText="Saving..."
        >
          Save changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full border border-[var(--border)] sm:w-auto"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
