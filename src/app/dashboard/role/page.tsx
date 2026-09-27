"use client";

import { CreateRoleUserForm } from "@/components/common/CreateRoleUserForm";

export default function RolePage() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Role</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create login credentials and assign the print certificates role.
        </p>
      </header>

      <CreateRoleUserForm />
    </main>
  );
}
