import { createHash, timingSafeEqual } from "node:crypto";

export function passwordsMatch(actual: string, expected: string): boolean {
  const digest = (value: string) =>
    createHash("sha256").update(value).digest();

  return timingSafeEqual(digest(actual), digest(expected));
}
