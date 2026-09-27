export type UserRole = "print_certificates";
export type AuthRole = "admin" | UserRole;

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  certificatesPrinted: number;
  createdAt: string;
};

export type PublicStaffUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  certificatesPrinted: number;
  createdAt: string;
};

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  certificatesPrinted: number;
  createdAt: string;
  readonly: boolean;
};

export type DashboardStats = {
  totalPersons: number;
  totalPrintCertificates: number;
};

export type CertificateIssue = {
  id: string;
  serialNumber: string;
  issuedDate: string;
  printedByUserId: string;
  printedByName: string;
  printedByEmail: string;
  qrPayload: string;
  createdAt: string;
};

export type CertificatePrintItem = {
  id: string;
  serialNumber: string;
  issuedDate: string;
  printedByName: string;
  qrPayload: string;
  qrDataUrl: string;
};

export function formatSerialNumber(sequence: number) {
  return String(sequence).padStart(9, "0");
}

export function displaySerialNumber(serial: string) {
  const digits = serial.replace(/\D/g, "");
  const value = digits || serial;
  return `S.NO#${value.padStart(9, "0")}`;
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "print_certificates", label: "Print Certificates" },
];

export function roleLabel(role: AuthRole) {
  if (role === "admin") return "Admin";
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}
