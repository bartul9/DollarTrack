import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { PublicUser, User } from "@shared/schema";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  const storedKey = Buffer.from(key, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return {
    id: rest.id,
    email: rest.email,
    name: rest.name,
  };
}
