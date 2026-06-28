import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudyProvider } from "./study-store";
import { RecommendedTopics } from "./recommended-topics";
import type { StudyData } from "./model";

const studyData: StudyData = {
  schemaVersion: 1,
  updatedAt: "2026-06-28T18:00:00.000+03:00",
  courses: [
    {
      id: "logic",
      name: "לוגיקה מתמטית",
      shortName: "לוגיקה",
      examAt: "2026-07-05T14:00:00.000+03:00",
      position: 0,
    },
  ],
  topics: [
    {
      id: "proofs",
      courseId: "logic",
      name: "שיטות הוכחה",
      level: "weak",
      importance: "high",
      nextAction: "לפתור שוב את תרגיל 3",
      subtopics: [],
      position: 0,
    },
  ],
};

describe("RecommendedTopics", () => {
  it("shows a saved next action under the topic name", () => {
    render(
      <StudyProvider initialData={studyData}>
        <RecommendedTopics
          topics={studyData.topics}
          courses={studyData.courses}
        />
      </StudyProvider>,
    );

    expect(screen.getByText("לפתור שוב את תרגיל 3")).toBeInTheDocument();
  });
});
