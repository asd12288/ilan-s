// @vitest-environment node

import { describe, expect, it } from "vitest";

import { passwordsMatch } from "./password";
import { createSessionToken, verifySessionToken } from "./token";

const secret = "test-session-secret-that-is-long-enough";

describe("session tokens", () => {
  it("verifies a token with the signing secret", async () => {
    const token = await createSessionToken(secret, 60);

    await expect(verifySessionToken(token, secret)).resolves.toBe(true);
  });

  it("rejects a token with another secret", async () => {
    const token = await createSessionToken(secret, 60);

    await expect(
      verifySessionToken(token, "another-session-secret-that-is-long-enough"),
    ).resolves.toBe(false);
  });

  it("rejects a missing token", async () => {
    await expect(verifySessionToken(undefined, secret)).resolves.toBe(false);
  });
});

describe("passwordsMatch", () => {
  it("accepts equal passwords", () => {
    expect(passwordsMatch("study", "study")).toBe(true);
  });

  it("rejects different passwords, including different lengths", () => {
    expect(passwordsMatch("study", "other")).toBe(false);
    expect(passwordsMatch("a", "a-long-password")).toBe(false);
  });
});
