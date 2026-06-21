import { describe, expect, it } from "vitest";

import { daysUntil, formatExamDate } from "./format";

describe("study date formatting", () => {
  it("rounds partial days up and never shows a negative count", () => {
    const now = new Date("2026-06-21T09:00:00.000Z");
    expect(daysUntil("2026-06-22T10:00:00.000Z", now)).toBe(2);
    expect(daysUntil("2026-06-20T10:00:00.000Z", now)).toBe(0);
  });

  it("uses a concise Hebrew exam date", () => {
    expect(formatExamDate("2026-07-05T14:00:00+03:00")).toMatch(/5 ביולי/);
  });
});
