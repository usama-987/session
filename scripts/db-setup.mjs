/**
 * Apply Neon schema (idempotent).
 * Usage: node --env-file=.env.local scripts/db-setup.mjs
 */
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("Missing DATABASE_URL. Set it in .env.local first.");
  process.exit(1);
}

const sql = neon(url);
const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");

const statements = schema
  .split(/;\s*\n/)
  .map((part) => part.replace(/--.*$/gm, "").trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("OK:", statement.slice(0, 60).replace(/\s+/g, " ") + "...");
}

console.log("\nNeon schema is ready.");
