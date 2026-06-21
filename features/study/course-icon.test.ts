// @vitest-environment node

import { describe, expect, it } from "vitest";
import { BookOpenIcon, CpuIcon } from "lucide-react";

import seedJson from "@/data/study-data.seed.json";
import { studyDataSchema } from "./model";
import { courseIcon } from "./course-icon";

const seed = studyDataSchema.parse(seedJson);

describe("courseIcon", () => {
  it("maps a known course to its distinct icon", () => {
    expect(courseIcon("low-level-languages")).toBe(CpuIcon);
  });

  it("falls back to the book icon for an unknown course", () => {
    expect(courseIcon("does-not-exist")).toBe(BookOpenIcon);
  });

  it("gives every seeded course a distinct, non-fallback icon", () => {
    const icons = seed.courses.map((course) => courseIcon(course.id));
    expect(new Set(icons).size).toBe(seed.courses.length);
    expect(icons).not.toContain(BookOpenIcon);
  });
});
