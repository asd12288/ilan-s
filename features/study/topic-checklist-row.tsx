"use client";

import { useEffect, useState, type CSSProperties } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { CourseIcon } from "./course-icon";
import { LevelMenu } from "./level-menu";
import type { Subtopic, Topic } from "./model";
import { useStudy } from "./study-store";
import { TopicEditor } from "./topic-editor";

const confettiPieces = [
  { x: "-20px", y: "-16px", rotate: "-28deg", color: "var(--primary)" },
  { x: "-12px", y: "-26px", rotate: "18deg", color: "var(--status-strong)" },
  { x: "0px", y: "-30px", rotate: "54deg", color: "var(--status-learning)" },
  { x: "13px", y: "-24px", rotate: "-42deg", color: "var(--status-weak)" },
  { x: "22px", y: "-12px", rotate: "24deg", color: "var(--primary)" },
  { x: "-17px", y: "5px", rotate: "48deg", color: "var(--status-learning)" },
  { x: "7px", y: "10px", rotate: "-18deg", color: "var(--status-strong)" },
  { x: "20px", y: "5px", rotate: "60deg", color: "var(--status-weak)" },
];

function SubtopicConfetti({ burst }: { burst: number }) {
  if (burst === 0) return null;

  return (
    <span
      key={burst}
      aria-hidden
      className="pointer-events-none absolute inset-1/2 z-10 size-0"
    >
      {confettiPieces.map((piece, index) => (
        <span
          key={`${burst}-${index}`}
          className="subtopic-confetti-piece absolute block size-1 rounded-[1px]"
          style={
            {
              "--confetti-x": piece.x,
              "--confetti-y": piece.y,
              "--confetti-rotate": piece.rotate,
              "--confetti-color": piece.color,
              animationDelay: `${index * 12}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

function SubtopicToggle({
  topicId,
  subtopic,
}: {
  topicId: string;
  subtopic: Subtopic;
}) {
  const { toggleSubtopic } = useStudy();
  const [burst, setBurst] = useState(0);
  const completed = subtopic.completed;
  const controlId = `${topicId}-${subtopic.id}`;

  useEffect(() => {
    if (burst === 0) return;

    const timeout = window.setTimeout(() => setBurst(0), 650);
    return () => window.clearTimeout(timeout);
  }, [burst]);

  function onCheckedChange(next: boolean) {
    if (next !== completed) {
      setBurst((current) => current + 1);
      toggleSubtopic(topicId, subtopic.id, next);
    }
  }

  return (
    <label
      htmlFor={controlId}
      className={cn(
        "flex min-h-10 cursor-pointer items-center justify-between gap-4 py-2 text-sm",
        completed && "text-muted-foreground",
      )}
    >
      <span className={cn(completed && "line-through")}>{subtopic.name}</span>
      <span className="relative grid shrink-0 place-items-center">
        <SubtopicConfetti burst={burst} />
        <Switch
          id={controlId}
          size="sm"
          checked={completed}
          onCheckedChange={onCheckedChange}
          aria-label={`${subtopic.name}: ${completed ? "עשיתי" : "לא עשיתי"}`}
        />
      </span>
    </label>
  );
}

export function TopicChecklistRow({
  topic,
  courseName,
}: {
  topic: Topic;
  courseName?: string;
}) {
  const subtopics = topic.subtopics.toSorted((a, b) => a.position - b.position);
  const completed = subtopics.filter((subtopic) => subtopic.completed).length;
  const hasChecklist = subtopics.length > 0;

  if (!hasChecklist) {
    return (
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto_7rem] items-center gap-2 border-b py-2",
          courseName &&
            "sm:grid-cols-[minmax(0,1.4fr)_minmax(8rem,1fr)_auto_7rem]",
        )}
      >
        <TopicEditor topic={topic} />
        {courseName ? (
          <span className="hidden truncate text-sm text-muted-foreground sm:block">
            {courseName}
          </span>
        ) : null}
        <span />
        <LevelMenu topicId={topic.id} level={topic.level} />
      </div>
    );
  }

  return (
    <Collapsible className="group/topic border-b">
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto_7rem] items-center gap-2 py-2",
          courseName &&
            "sm:grid-cols-[minmax(0,1.4fr)_minmax(8rem,1fr)_auto_7rem]",
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-right text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 [&_svg]:size-4"
          >
            <CourseIcon courseId={topic.courseId} className="shrink-0" aria-hidden />
            <span className="truncate">{topic.name}</span>
            <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
              {completed}/{subtopics.length}
            </span>
          </button>
        </CollapsibleTrigger>
        {courseName ? (
          <span className="hidden truncate text-sm text-muted-foreground sm:block">
            {courseName}
          </span>
        ) : null}
        <TopicEditor topic={topic} compact />
        <LevelMenu topicId={topic.id} level={topic.level} />
      </div>

      <CollapsibleContent>
        <div className="mb-3 me-9 border-s ps-4 sm:me-10">
          {subtopics.map((subtopic) => (
            <SubtopicToggle
              key={subtopic.id}
              topicId={topic.id}
              subtopic={subtopic}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
