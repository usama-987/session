type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(15,61,62,0.45)]">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--brand)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-[var(--muted)]">{hint}</p> : null}
    </article>
  );
}
