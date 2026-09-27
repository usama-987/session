"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { roleLabel, type DirectoryUser } from "@/lib/types";

type UsersTableProps = {
  users: DirectoryUser[];
  loading?: boolean;
  onEdit: (user: DirectoryUser) => void;
  onDeleted: (userId: string) => void;
};

export function UsersTable({
  users,
  loading = false,
  onEdit,
  onDeleted,
}: UsersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(user: DirectoryUser) {
    if (user.readonly || user.role === "admin") return;

    const confirmed = window.confirm(
      `Delete ${user.name}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");
    setDeletingId(user.id);

    try {
      const response = await apiFetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "Unable to delete user.");
        return;
      }

      onDeleted(user.id);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading users...</p>;
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No users yet. Create one from the Role page.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[#f8fbfa] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Printed by user</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isLocked = user.readonly || user.role === "admin";

              return (
                <tr
                  key={user.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{user.email}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {roleLabel(user.role)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {user.certificatesPrinted}
                  </td>
                  <td className="px-4 py-3">
                    {isLocked ? (
                      <span className="text-xs font-medium text-[var(--muted)]">
                        View only
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="rounded-lg border border-[var(--danger)]/30 px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === user.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
