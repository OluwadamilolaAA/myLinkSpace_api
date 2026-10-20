import {
  randomBytes,
  createHash,
} from "node:crypto";

const RESET_TOKEN_DURATION_MS = 15 * 60 * 1000;

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(
  token: string
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function getPasswordResetExpiry(): Date {
  return new Date(
    Date.now() + RESET_TOKEN_DURATION_MS
  );
}