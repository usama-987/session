import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

function isHashedPassword(value: string) {
  return value.startsWith(`${HASH_PREFIX}$`);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${HASH_PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  if (!isHashedPassword(stored)) {
    // Legacy plaintext support during migration.
    return stored === password;
  }

  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;

  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const storedHash = Buffer.from(hash, "hex");

  if (storedHash.length !== derived.length) return false;
  return timingSafeEqual(storedHash, derived);
}

export function looksLikeHashedPassword(value: string) {
  return isHashedPassword(value);
}
