import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`DELETE FROM certificates`;
await sql`DELETE FROM sessions`;
await sql`DELETE FROM users`;

await sql`
  INSERT INTO app_meta (key, value) VALUES ('next_serial', '6000')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
`;

await sql`
  INSERT INTO app_meta (key, value) VALUES ('prior_print_count', '6000')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
`;

const users = await sql`SELECT COUNT(*)::int AS c FROM users`;
const certs = await sql`SELECT COUNT(*)::int AS c FROM certificates`;
const meta = await sql`
  SELECT key, value FROM app_meta
  WHERE key IN ('next_serial', 'prior_print_count')
  ORDER BY key
`;

console.log(
  JSON.stringify(
    {
      users: users[0].c,
      certificates: certs[0].c,
      meta,
      nextPrintSerial: "S.NO#000006000",
      dashboardTotal: 6000,
    },
    null,
    2,
  ),
);
