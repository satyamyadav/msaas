import { createHash, randomBytes } from "crypto";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NON_ALPHANUMERIC = /[^a-z0-9]+/g;

export function slugify(value: string, options?: { maxLength?: number }) {
  const maxLength = options?.maxLength ?? 48;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(NON_ALPHANUMERIC, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const sliced = normalized.slice(0, maxLength);
  return sliced || `org-${randomId(6)}`;
}

export function randomId(length = 8) {
  const bytes = randomBytes(length);
  return bytes.toString("base64url").slice(0, length);
}

export function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
