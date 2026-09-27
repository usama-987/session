import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
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

type StoreData = {
  users: StaffUser[];
  sessions: AuthSession[];
  certificates: CertificateIssue[];
  nextSerial: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

async function ensureStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const store: StoreData = {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      certificates: Array.isArray(parsed.certificates)
        ? parsed.certificates
        : [],
      nextSerial:
        typeof parsed.nextSerial === "number" && parsed.nextSerial > 0
          ? parsed.nextSerial
          : deriveNextSerial(parsed),
    };
    return reconcileCertificateCounts(await migratePlaintextPasswords(store));
  } catch {
    const empty: StoreData = {
      users: [],
      sessions: [],
      certificates: [],
      nextSerial: 1,
    };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function reconcileCertificateCounts(store: StoreData) {
  let changed = false;

  for (const user of store.users) {
    const printed = store.certificates.filter(
      (certificate) => certificate.printedByUserId === user.id,
    ).length;

    if (user.certificatesPrinted !== printed) {
      user.certificatesPrinted = printed;
      changed = true;
    }
  }

  const expectedNext =
    store.certificates.reduce((max, certificate) => {
      const match = /^CERT-(\d+)$/.exec(certificate.serialNumber);
      const value = match ? Number(match[1]) : 0;
      return Math.max(max, value);
    }, 0) + 1;

  if (expectedNext > store.nextSerial) {
    store.nextSerial = expectedNext;
    changed = true;
  }

  if (changed) {
    await writeStore(store);
  }

  return store;
}

function deriveNextSerial(parsed: Partial<StoreData>) {
  const fromCertificates = Array.isArray(parsed.certificates)
    ? parsed.certificates.length
    : 0;
  const fromUsers = Array.isArray(parsed.users)
    ? parsed.users.reduce(
        (sum, user) => sum + (user.certificatesPrinted || 0),
        0,
      )
    : 0;
  return Math.max(fromCertificates, fromUsers, 0) + 1;
}

async function migratePlaintextPasswords(store: StoreData) {
  let changed = false;

  for (const user of store.users) {
    if (!looksLikeHashedPassword(user.password)) {
      user.password = await hashPassword(user.password);
      changed = true;
    }
  }

  if (changed) {
    await writeStore(store);
  }

  return store;
}

async function writeStore(data: StoreData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getUsers() {
  const store = await ensureStore();
  return store.users;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const store = await ensureStore();
  const email = input.email.trim().toLowerCase();

  if (store.users.some((user) => user.email === email)) {
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

  store.users.unshift(user);
  await writeStore(store);
  return user;
}

export async function getDashboardStats() {
  const store = await ensureStore();
  return {
    totalPersons: store.users.length,
    totalPrintCertificates: store.certificates.length,
  };
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
}) {
  const store = await ensureStore();
  const printer = resolvePrinter(store, input.printer);
  const { quantity, issuedDate } = normalizePrintInput(input);
  const certificates = buildCertificateBatch({
    printer,
    quantity,
    issuedDate,
    startSerial: store.nextSerial,
  });

  return {
    certificatesPrinted: countPrintedBy(store, printer.id),
    certificates,
  };
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
}) {
  const store = await ensureStore();
  const printer = resolvePrinter(store, input.printer);
  const { quantity, issuedDate } = normalizePrintInput(input);
  const certificates = buildCertificateBatch({
    printer,
    quantity,
    issuedDate,
    startSerial: store.nextSerial,
  });

  store.nextSerial += quantity;
  store.certificates.unshift(...certificates);

  if (printer.role !== "admin") {
    const staffUser = store.users.find((user) => user.id === printer.id);
    if (staffUser) {
      staffUser.certificatesPrinted += quantity;
    }
  }

  await writeStore(store);

  return {
    certificatesPrinted: countPrintedBy(store, printer.id),
    certificates,
  };
}

export async function getPrintedCountForAccount(input: {
  id: string;
  name?: string;
  email: string;
  role: AuthRole;
}) {
  const store = await ensureStore();
  const printer = resolvePrinter(store, {
    id: input.id,
    name: input.name || (input.role === "admin" ? "Admin" : "User"),
    email: input.email,
    role: input.role,
  });
  return countPrintedBy(store, printer.id);
}

function countPrintedBy(store: StoreData, printerId: string) {
  return store.certificates.filter(
    (certificate) => certificate.printedByUserId === printerId,
  ).length;
}

function resolvePrinter(
  store: StoreData,
  input: { id: string; name: string; email: string; role: AuthRole },
) {
  if (input.role === "admin") {
    return {
      id: "admin",
      name: input.name || "Admin",
      email: input.email,
      role: "admin" as const,
    };
  }

  const user = store.users.find(
    (entry) =>
      entry.id === input.id ||
      entry.email === input.email.trim().toLowerCase(),
  );

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
      qrPayload: JSON.stringify({
        serial: serialNumber,
        date: input.issuedDate,
        issuer: input.printer.email,
      }),
      createdAt,
    });
  }

  return batch;
}

export async function getUserById(id: string) {
  const store = await ensureStore();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function getUserByEmail(email: string) {
  const store = await ensureStore();
  return (
    store.users.find((user) => user.email === email.trim().toLowerCase()) ??
    null
  );
}

export async function findStaffByCredentials(email: string, password: string) {
  const store = await ensureStore();
  const user = store.users.find(
    (entry) => entry.email === email.trim().toLowerCase(),
  );

  if (!user) return null;

  const valid = await verifyPassword(password, user.password);
  return valid ? user : null;
}

export async function createSession(input: {
  name: string;
  email: string;
  token: string;
  role: AuthRole;
  userId?: string;
}) {
  const store = await ensureStore();
  store.sessions = store.sessions.filter(
    (session) => session.token !== input.token,
  );
  store.sessions.push({
    token: input.token,
    name: input.name,
    email: input.email,
    role: input.role,
    userId: input.userId,
    createdAt: new Date().toISOString(),
  });
  await writeStore(store);
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
  const store = await ensureStore();
  return store.sessions.find((session) => session.token === token) ?? null;
}

/** @deprecated use getSession */
export async function getAdminSession(token: string) {
  return getSession(token);
}

export async function removeSession(token: string) {
  const store = await ensureStore();
  const before = store.sessions.length;
  store.sessions = store.sessions.filter((session) => session.token !== token);
  await writeStore(store);
  return before !== store.sessions.length;
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
  const store = await ensureStore();
  const index = store.users.findIndex((user) => user.id === id);

  if (index === -1) {
    throw new Error("User not found.");
  }

  const email = input.email.trim().toLowerCase();
  const emailTaken = store.users.some(
    (user) => user.email === email && user.id !== id,
  );

  if (emailTaken) {
    throw new Error("A user with this email already exists.");
  }

  const current = store.users[index];
  const updated: StaffUser = {
    ...current,
    name: input.name.trim(),
    email,
    role: input.role,
    password:
      input.password && input.password.length > 0
        ? await hashPassword(input.password)
        : current.password,
  };

  store.users[index] = updated;
  await writeStore(store);
  return updated;
}

export async function deleteUser(id: string) {
  const store = await ensureStore();
  const index = store.users.findIndex((user) => user.id === id);

  if (index === -1) {
    throw new Error("User not found.");
  }

  const [removed] = store.users.splice(index, 1);
  await writeStore(store);
  return removed;
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
  const store = await ensureStore();
  const adminPrinted = store.certificates.filter(
    (certificate) => certificate.printedByUserId === "admin",
  ).length;

  const adminEntry = {
    id: "admin",
    name: process.env.ADMIN_NAME?.trim() || "Admin",
    email: (process.env.ADMIN_EMAIL ?? "admin@session.com").trim().toLowerCase(),
    role: "admin" as const,
    certificatesPrinted: adminPrinted,
    createdAt: "",
    readonly: true,
  };

  const staffEntries = store.users.map((user) => ({
    ...toPublicUser(user),
    readonly: false as const,
  }));

  return [adminEntry, ...staffEntries];
}
