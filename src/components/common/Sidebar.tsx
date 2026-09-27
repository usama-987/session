"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  href: string;
  label: string;
  exact?: boolean;
};

type SidebarProps = {
  title?: string;
  subtitle?: string;
  items: SidebarItem[];
};

export function Sidebar({
  title = "Session",
  subtitle = "Admin Panel",
  items,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-[var(--border)] bg-[var(--brand)] text-white md:min-h-full md:w-64 md:border-b-0 md:border-r md:border-[var(--border)]">
      <div className="px-5 py-6">
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          {title}
        </p>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
      </div>

      <nav className="flex gap-2 px-3 pb-4 md:flex-1 md:flex-col md:gap-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export const ADMIN_NAV_ITEMS: SidebarItem[] = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/role", label: "Role" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/certificates", label: "Certificates" },
];

export const STAFF_NAV_ITEMS: SidebarItem[] = [
  { href: "/print", label: "Certificates", exact: true },
];
