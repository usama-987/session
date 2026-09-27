import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Add your Neon connection string to .env.local (and Vercel env).",
    );
  }

  if (!sqlClient) {
    sqlClient = neon(url);
  }

  return sqlClient;
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          certificates_printed INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL,
          user_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS certificates (
          id TEXT PRIMARY KEY,
          serial_number TEXT NOT NULL,
          issued_date TEXT NOT NULL,
          printed_by_user_id TEXT NOT NULL,
          printed_by_name TEXT NOT NULL,
          printed_by_email TEXT NOT NULL,
          qr_payload TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS certificates_serial_idx
        ON certificates (serial_number)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS certificates_printer_idx
        ON certificates (printed_by_user_id)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `;

      await sql`
        INSERT INTO app_meta (key, value)
        VALUES
          ('next_serial', '6000'),
          ('prior_print_count', '6000')
        ON CONFLICT (key) DO NOTHING
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  await schemaReady;
}
