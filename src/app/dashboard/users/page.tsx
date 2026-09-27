"use client";

import { useCallback, useEffect, useState } from "react";
import { EditUserForm } from "@/components/common/EditUserForm";
import { UsersTable } from "@/components/common/UsersTable";
import { apiFetch } from "@/lib/api-client";
import type { DirectoryUser, PublicStaffUser } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<PublicStaffUser | null>(null);
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/users");
      const data = (await response.json()) as {
        users?: DirectoryUser[];
        message?: string;
      };

      if (!response.ok) {
        setError(data.message || "Unable to load users.");
        return;
      }

      setUsers(data.users ?? []);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Users
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Admin print totals are shown as view-only. Staff accounts can be edited
          or deleted. Overall total is on the Dashboard.
        </p>
      </header>

      {error ? (
        <p className="mb-6 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mb-6 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
          {success}
        </p>
      ) : null}

      {editingUser ? (
        <div className="mb-8 max-w-xl">
          <EditUserForm
            user={editingUser}
            onCancel={() => setEditingUser(null)}
            onUpdated={(updated) => {
              setUsers((current) =>
                current.map((user) =>
                  user.id === updated.id
                    ? { ...updated, readonly: false }
                    : user,
                ),
              );
              setEditingUser(null);
              setSuccess("User updated successfully.");
            }}
          />
        </div>
      ) : null}

      <UsersTable
        users={users}
        loading={loading}
        onEdit={(user) => {
          if (user.readonly || user.role === "admin") return;
          setSuccess("");
          setEditingUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: "print_certificates",
            certificatesPrinted: user.certificatesPrinted,
            createdAt: user.createdAt,
          });
        }}
        onDeleted={(userId) => {
          setUsers((current) => current.filter((user) => user.id !== userId));
          if (editingUser?.id === userId) {
            setEditingUser(null);
          }
          setSuccess("User deleted successfully.");
        }}
      />
    </main>
  );
}
