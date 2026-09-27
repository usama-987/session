import { randomUUID } from "crypto";
import {
  buildCertificateVerifyUrl,
  normalizeCertificateSerial,
} from "@/lib/app-url";
import { ensureSchema, getSql } from "@/lib/db";
import {
  hashPassword,
  looksLikeHashedPassword,
  verifyPassword,
} from "@/lib/password";
import type {
  AuthRole,
  CertificateIssue,
  StaffUser,
  UserRole,
} from "@/lib/types";
import { formatSerialNumber } from "@/lib/types";

type AuthSession = {
  token: string;
  name: string;
  email: string;
  role: AuthRole;
  userId?: string;
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  certificates_printed: number;
  created_at: string | Date;
};

type SessionRow = {
  token: string;
  name: string;
  email: string;
  role: string;
  user_id: string | null;
  created_at: string | Date;
};

type CertificateRow = {
  id: string;
  serial_number: string;
  issued_date: string;
  printed_by_user_id: string;
  printed_by_name: string;
  printed_by_email: string;
  qr_payload: string;
  created_at: string | Date;
};

function toIso(value: string | Date) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapUser(row: UserRow): StaffUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as UserRole,
    certificatesPrinted: Number(row.certificates_printed) || 0,
    createdAt: toIso(row.created_at),
  };
}

function mapSession(row: SessionRow): AuthSession {
  return {
    token: row.token,
    name: row.name,
    email: row.email,
    role: row.role as AuthRole,
    userId: row.user_id || undefined,
    createdAt: toIso(row.created_at),
  };
}

function mapCertificate(row: CertificateRow): CertificateIssue {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    issuedDate: row.issued_date,
    printedByUserId: row.printed_by_user_id,
    printedByName: row.printed_by_name,
    printedByEmail: row.printed_by_email,
    qrPayload: row.qr_payload,
    createdAt: toIso(row.created_at),
  };
}

async function withDb<T>(fn: () => Promise<T>) {
  await ensureSchema();
  return fn();
}

async function getMetaNumber(key: string, fallback: number) {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM app_meta WHERE key = ${key} LIMIT 1
  `) as { value: string }[];
  const value = Number(rows[0]?.value);
  return Number.isFinite(value) ? value : fallback;
}

async function setMetaNumber(key: string, value: number) {
  const sql = getSql();
  await sql`
    INSERT INTO app_meta (key, value)
    VALUES (${key}, ${String(value)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}

async function getPriorPrintCount() {
  return getMetaNumber("prior_print_count", 0);
}

async function getNextSerial() {
  return getMetaNumber("next_serial", 1);
}

async function countCertificates() {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM certificates
  `) as { count: number }[];
  return Number(rows[0]?.count) || 0;
}

async function countPrintedBy(printerId: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM certificates
    WHERE printed_by_user_id = ${printerId}
  `) as { count: number }[];
  return Number(rows[0]?.count) || 0;
}

export async function getUsers() {
  return withDb(async () => {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM users ORDER BY created_at DESC
    `) as UserRow[];
    return rows.map(mapUser);
  });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  return withDb(async () => {
    const sql = getSql();
    const email = input.email.trim().toLowerCase();

    const existing = (await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `) as { id: string }[];

    if (existing.length > 0) {
      throw new Error("A user with this email already exists.");
    }

    const user: StaffUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      password: await hashPassword(input.password),
      role: input.role,
      certificatesPrinted: 0,
      createdAt: new Date().toISOString(),
    };

    await sql`
      INSERT INTO users (
        id, name, email, password, role, certificates_printed, created_at
      ) VALUES (
        ${user.id},
        ${user.name},
        ${user.email},
        ${user.password},
        ${user.role},
        ${user.certificatesPrinted},
        ${user.createdAt}
      )
    `;

    return user;
  });
}

export async function getDashboardStats() {
  return withDb(async () => {
    const sql = getSql();
    const userRows = (await sql`
      SELECT COUNT(*)::int AS count FROM users
    `) as { count: number }[];
    const prior = await getPriorPrintCount();
    const printed = await countCertificates();

    return {
      totalPersons: Number(userRows[0]?.count) || 0,
      totalPrintCertificates: prior + printed,
    };
  });
}

export async function previewCertificatePrint(input: {
  printer: {
    id: string;
    name: string;
    email: string;
    role: AuthRole;
  };
  quantity?: number;
  issuedDate?: string;
  baseUrl: string;
}) {
  return withDb(async () => {
    const printer = await resolvePrinter(input.printer);
    const { quantity, issuedDate } = normalizePrintInput(input);
    const nextSerial = await getNextSerial();
    const prior = await getPriorPrintCount();
    const certificates = buildCertificateBatch({
      printer,
      quantity,
      issuedDate,
      startSerial: nextSerial,
      baseUrl: input.baseUrl,
    });

    const printed = await countPrintedBy(printer.id);

    return {
      certificatesPrinted:
        printer.role === "admin" ? prior + printed : printed,
      certificates,
    };
  });
}

export async function recordCertificatePrint(input: {
  printer: {
    id: string;
    name: string;
    email: string;
    role: AuthRole;
  };
  quantity?: number;
  issuedDate?: string;
  baseUrl: string;
}) {
  return withDb(async () => {
    const sql = getSql();
    const printer = await resolvePrinter(input.printer);
    const { quantity, issuedDate } = normalizePrintInput(input);

    const serialRows = (await sql`
      UPDATE app_meta
      SET value = ((value::integer) + ${quantity})::text
      WHERE key = 'next_serial'
      RETURNING ((value::integer) - ${quantity}) AS start_serial
    `) as { start_serial: number }[];

    let startSerial = Number(serialRows[0]?.start_serial);
    if (!Number.isFinite(startSerial)) {
      startSerial = await getNextSerial();
      await setMetaNumber("next_serial", startSerial + quantity);
    }

    const certificates = buildCertificateBatch({
      printer,
      quantity,
      issuedDate,
      startSerial,
      baseUrl: input.baseUrl,
    });

    for (const certificate of certificates) {
      await sql`
        INSERT INTO certificates (
          id,
          serial_number,
          issued_date,
          printed_by_user_id,
          printed_by_name,
          printed_by_email,
          qr_payload,
          created_at
        ) VALUES (
          ${certificate.id},
          ${certificate.serialNumber},
          ${certificate.issuedDate},
          ${certificate.printedByUserId},
          ${certificate.printedByName},
          ${certificate.printedByEmail},
          ${certificate.qrPayload},
          ${certificate.createdAt}
        )
      `;
    }

    if (printer.role !== "admin") {
      await sql`
        UPDATE users
        SET certificates_printed = certificates_printed + ${quantity}
        WHERE id = ${printer.id}
      `;
    }

    const prior = await getPriorPrintCount();
    const printed = await countPrintedBy(printer.id);

    return {
      certificatesPrinted:
        printer.role === "admin" ? prior + printed : printed,
      certificates,
    };
  });
}

export async function getPrintedCountForAccount(input: {
  id: string;
  name?: string;
  email: string;
  role: AuthRole;
}) {
  return withDb(async () => {
    const printer = await resolvePrinter({
      id: input.id,
      name: input.name || (input.role === "admin" ? "Admin" : "User"),
      email: input.email,
      role: input.role,
    });
    const printed = await countPrintedBy(printer.id);
    if (printer.role === "admin") {
      return (await getPriorPrintCount()) + printed;
    }
    return printed;
  });
}

async function resolvePrinter(input: {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}) {
  if (input.role === "admin") {
    return {
      id: "admin",
      name: input.name || "Admin",
      email: input.email,
      role: "admin" as const,
    };
  }

  const sql = getSql();
  const email = input.email.trim().toLowerCase();
  const rows = (await sql`
    SELECT * FROM users
    WHERE id = ${input.id} OR email = ${email}
    LIMIT 1
  `) as UserRow[];

  const user = rows[0] ? mapUser(rows[0]) : null;

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role !== "print_certificates") {
    throw new Error("This user is not allowed to print certificates.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function normalizePrintInput(input: {
  quantity?: number;
  issuedDate?: string;
}) {
  const quantity = Math.floor(input.quantity ?? 1);
  if (quantity < 1 || quantity > 100) {
    throw new Error("Quantity must be between 1 and 100.");
  }

  const issuedDate = (input.issuedDate || new Date().toISOString().slice(0, 10))
    .trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedDate)) {
    throw new Error("Issued date must be in YYYY-MM-DD format.");
  }

  return { quantity, issuedDate };
}

function buildCertificateBatch(input: {
  printer: {
    id: string;
    name: string;
    email: string;
  };
  quantity: number;
  issuedDate: string;
  startSerial: number;
  baseUrl: string;
}) {
  const createdAt = new Date().toISOString();
  const batch: CertificateIssue[] = [];

  for (let index = 0; index < input.quantity; index += 1) {
    const serialNumber = formatSerialNumber(input.startSerial + index);

    batch.push({
      id: randomUUID(),
      serialNumber,
      issuedDate: input.issuedDate,
      printedByUserId: input.printer.id,
      printedByName: input.printer.name,
      printedByEmail: input.printer.email,
      qrPayload: buildCertificateVerifyUrl(serialNumber, input.baseUrl),
      createdAt,
    });
  }

  return batch;
}

export async function getCertificateBySerial(serial: string) {
  return withDb(async () => {
    const sql = getSql();
    const needle = normalizeCertificateSerial(serial);
    const digits = serial.replace(/\D/g, "");

    const rows = (await sql`
      SELECT * FROM certificates
      WHERE serial_number = ${needle}
         OR serial_number = ${serial.trim()}
         OR regexp_replace(serial_number, '\D', '', 'g') = ${digits}
      ORDER BY created_at DESC
      LIMIT 1
    `) as CertificateRow[];

    return rows[0] ? mapCertificate(rows[0]) : null;
  });
}

export async function getUserById(id: string) {
  return withDb(async () => {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `) as UserRow[];
    return rows[0] ? mapUser(rows[0]) : null;
  });
}

export async function getUserByEmail(email: string) {
  return withDb(async () => {
    const sql = getSql();
    const normalized = email.trim().toLowerCase();
    const rows = (await sql`
      SELECT * FROM users WHERE email = ${normalized} LIMIT 1
    `) as UserRow[];
    return rows[0] ? mapUser(rows[0]) : null;
  });
}

export async function findStaffByCredentials(email: string, password: string) {
  return withDb(async () => {
    const user = await getUserByEmail(email);
    if (!user) return null;

    if (!looksLikeHashedPassword(user.password)) {
      const hashed = await hashPassword(user.password);
      const sql = getSql();
      await sql`
        UPDATE users SET password = ${hashed} WHERE id = ${user.id}
      `;
      user.password = hashed;
    }

    const valid = await verifyPassword(password, user.password);
    return valid ? user : null;
  });
}

export async function createSession(input: {
  name: string;
  email: string;
  token: string;
  role: AuthRole;
  userId?: string;
}) {
  return withDb(async () => {
    const sql = getSql();
    await sql`DELETE FROM sessions WHERE token = ${input.token}`;
    await sql`
      INSERT INTO sessions (token, name, email, role, user_id, created_at)
      VALUES (
        ${input.token},
        ${input.name},
        ${input.email},
        ${input.role},
        ${input.userId ?? null},
        ${new Date().toISOString()}
      )
    `;
  });
}

/** @deprecated use createSession */
export async function createAdminSession(input: {
  name: string;
  email: string;
  token: string;
}) {
  return createSession({ ...input, role: "admin" });
}

export async function getSession(token: string) {
  return withDb(async () => {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM sessions WHERE token = ${token} LIMIT 1
    `) as SessionRow[];
    return rows[0] ? mapSession(rows[0]) : null;
  });
}

/** @deprecated use getSession */
export async function getAdminSession(token: string) {
  return getSession(token);
}

export async function removeSession(token: string) {
  return withDb(async () => {
    const sql = getSql();
    const result = (await sql`
      DELETE FROM sessions WHERE token = ${token} RETURNING token
    `) as { token: string }[];
    return result.length > 0;
  });
}

/** @deprecated use removeSession */
export async function removeAdminSession(token: string) {
  return removeSession(token);
}

export async function updateUser(
  id: string,
  input: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
  },
) {
  return withDb(async () => {
    const sql = getSql();
    const currentRows = (await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `) as UserRow[];

    if (!currentRows[0]) {
      throw new Error("User not found.");
    }

    const current = mapUser(currentRows[0]);
    const email = input.email.trim().toLowerCase();

    const taken = (await sql`
      SELECT id FROM users WHERE email = ${email} AND id <> ${id} LIMIT 1
    `) as { id: string }[];

    if (taken.length > 0) {
      throw new Error("A user with this email already exists.");
    }

    const password =
      input.password && input.password.length > 0
        ? await hashPassword(input.password)
        : current.password;

    const updated: StaffUser = {
      ...current,
      name: input.name.trim(),
      email,
      role: input.role,
      password,
    };

    await sql`
      UPDATE users
      SET
        name = ${updated.name},
        email = ${updated.email},
        role = ${updated.role},
        password = ${updated.password}
      WHERE id = ${id}
    `;

    return updated;
  });
}

export async function deleteUser(id: string) {
  return withDb(async () => {
    const sql = getSql();
    const rows = (await sql`
      DELETE FROM users WHERE id = ${id} RETURNING *
    `) as UserRow[];

    if (!rows[0]) {
      throw new Error("User not found.");
    }

    return mapUser(rows[0]);
  });
}

export function toPublicUser(user: StaffUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    certificatesPrinted: user.certificatesPrinted,
    createdAt: user.createdAt,
  };
}

export async function getDirectoryUsers() {
  return withDb(async () => {
    const prior = await getPriorPrintCount();
    const adminPrinted = prior + (await countPrintedBy("admin"));
    const users = await getUsers();

    const adminEntry = {
      id: "admin",
      name: process.env.ADMIN_NAME?.trim() || "Admin",
      email: (
        process.env.ADMIN_EMAIL ?? "admin@session.com"
      ).trim().toLowerCase(),
      role: "admin" as const,
      certificatesPrinted: adminPrinted,
      createdAt: "",
      readonly: true,
    };

    const staffEntries = users.map((user) => ({
      ...toPublicUser(user),
      readonly: false as const,
    }));

    return [adminEntry, ...staffEntries];
  });
}
