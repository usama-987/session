import { StaffShell } from "@/components/common/StaffShell";

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell>{children}</StaffShell>;
}
