type AccountRow = {
  id: string;
  name: string;
  email: string;
};

type AccountsListProps = {
  accounts: AccountRow[];
  loading?: boolean;
};

export function AccountsList({ accounts, loading = false }: AccountsListProps) {
  if (loading) {
    return (
      <p className="text-sm text-[var(--muted)]">Loading accounts...</p>
    );
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No accounts yet. Create one from the Role page.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[#f8fbfa] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr
              key={account.id}
              className="border-b border-[var(--border)] last:border-b-0"
            >
              <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                {account.name}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">{account.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
