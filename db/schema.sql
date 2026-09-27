-- Neon Postgres schema for Session certificate app (serverless)
-- Applied automatically on first API request via ensureSchema().

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  certificates_printed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  printed_by_user_id TEXT NOT NULL,
  printed_by_name TEXT NOT NULL,
  printed_by_email TEXT NOT NULL,
  qr_payload TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS certificates_serial_idx ON certificates (serial_number);
CREATE INDEX IF NOT EXISTS certificates_printer_idx ON certificates (printed_by_user_id);

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_meta (key, value)
VALUES
  ('next_serial', '6000'),
  ('prior_print_count', '6000')
ON CONFLICT (key) DO NOTHING;
