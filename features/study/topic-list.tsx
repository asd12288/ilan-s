"use client";

import { useMemo, useState } from "react";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Course, Topic, TopicLevel } from "./model";
import { TopicChecklistRow } from "./topic-checklist-row";

type LevelFilter = TopicLevel | "all";

export function TopicList({ topics, courses }: { topics: Topic[]; courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const visible = topics.filter((topic) =>
    topic.name.toLowerCase().includes(query.toLowerCase()) &&
    (courseId === "all" || topic.courseId === courseId) &&
    (level === "all" || topic.level === level),
  );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_12rem_10rem]">
        <Field>
          <FieldLabel htmlFor="topic-search" className="sr-only">חיפוש נושאים</FieldLabel>
          <Input id="topic-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש" />
        </Field>
        <Field>
          <FieldLabel htmlFor="course-filter" className="sr-only">קורס</FieldLabel>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger id="course-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">כל הקורסים</SelectItem>
                {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.shortName}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="level-filter" className="sr-only">רמה</FieldLabel>
          <Select value={level} onValueChange={(value) => setLevel(value as LevelFilter)}>
            <SelectTrigger id="level-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">כל הרמות</SelectItem>
                <SelectItem value="not-started">טרם התחיל</SelectItem>
                <SelectItem value="weak">חלש</SelectItem>
                <SelectItem value="learning">בלמידה</SelectItem>
                <SelectItem value="strong">חזק</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div>
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">אין נושאים</p>
        ) : (
          <div>
            {visible.map((topic) => (
              <TopicChecklistRow
                key={topic.id}
                topic={topic}
                courseName={courseById.get(topic.courseId)?.shortName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
