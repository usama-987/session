/**
 * One-time migrate from data/store.json into Neon.
 * Usage: node --env-file=.env.local scripts/db-migrate-json.mjs
 */
import { readFileSync, existsSync } from "fs";
import { neon } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL?.trim();
const jsonPath = path.join(__dirname, "..", "data", "store.json");

if (!url) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

if (!existsSync(jsonPath)) {
  console.error("No data/store.json found to migrate.");
  process.exit(1);
}

const sql = neon(url);
const store = JSON.parse(readFileSync(jsonPath, "utf8"));

await sql`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  certificates_printed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  printed_by_user_id TEXT NOT NULL,
  printed_by_name TEXT NOT NULL,
  printed_by_email TEXT NOT NULL,
  qr_payload TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`;

for (const user of store.users || []) {
  await sql`
    INSERT INTO users (id, name, email, password, role, certificates_printed, created_at)
    VALUES (
      ${user.id},
      ${user.name},
      ${user.email},
      ${user.password},
      ${user.role},
      ${user.certificatesPrinted ?? 0},
      ${user.createdAt || new Date().toISOString()}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      certificates_printed = EXCLUDED.certificates_printed
  `;
}

for (const session of store.sessions || []) {
  await sql`
    INSERT INTO sessions (token, name, email, role, user_id, created_at)
    VALUES (
      ${session.token},
      ${session.name},
      ${session.email},
      ${session.role},
      ${session.userId ?? null},
      ${session.createdAt || new Date().toISOString()}
    )
    ON CONFLICT (token) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      user_id = EXCLUDED.user_id
  `;
}

for (const cert of store.certificates || []) {
  await sql`
    INSERT INTO certificates (
      id, serial_number, issued_date, printed_by_user_id,
      printed_by_name, printed_by_email, qr_payload, created_at
    ) VALUES (
      ${cert.id},
      ${cert.serialNumber},
      ${cert.issuedDate},
      ${cert.printedByUserId},
      ${cert.printedByName},
      ${cert.printedByEmail},
      ${cert.qrPayload},
      ${cert.createdAt || new Date().toISOString()}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

const nextSerial = Number(store.nextSerial) || 1;
const prior = Number(store.priorPrintCount) || 0;

await sql`
  INSERT INTO app_meta (key, value) VALUES ('next_serial', ${String(nextSerial)})
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
`;
await sql`
  INSERT INTO app_meta (key, value) VALUES ('prior_print_count', ${String(prior)})
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
`;

console.log("Migrated:", {
  users: (store.users || []).length,
  sessions: (store.sessions || []).length,
  certificates: (store.certificates || []).length,
  nextSerial,
  priorPrintCount: prior,
});
