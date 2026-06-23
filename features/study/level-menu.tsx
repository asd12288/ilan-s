"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { TopicLevel } from "./model";
import { useStudy } from "./study-store";

const labels: Record<TopicLevel, string> = {
  "not-started": "לא התחלתי",
  weak: "צריך חיזוק",
  learning: "בלמידה",
  strong: "שולט",
};

const tones: Record<TopicLevel, string> = {
  "not-started": "bg-status-not-started",
  weak: "bg-status-weak",
  learning: "bg-status-learning",
  strong: "bg-status-strong",
};

// Colored pill so the level reads at a glance; not-started stays quiet.
const pillTones: Record<TopicLevel, string> = {
  "not-started": "bg-muted text-muted-foreground hover:bg-muted/70",
  weak: "bg-status-weak/10 text-status-weak hover:bg-status-weak/15",
  learning: "bg-status-learning/10 text-status-learning hover:bg-status-learning/15",
  strong: "bg-status-strong/10 text-status-strong hover:bg-status-strong/15",
};

const order: TopicLevel[] = ["not-started", "weak", "learning", "strong"];

export function LevelMenu({
  topicId,
  level,
}: {
  topicId: string;
  level: TopicLevel;
}) {
  const { setTopicLevel } = useStudy();

  function onSelect(value: string) {
    const next = value as TopicLevel;
    if (next !== level) setTopicLevel(topicId, next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`רמה: ${labels[level]}`}
          className={cn(
            "inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-2xl ps-2 pe-1.5 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
            pillTones[level],
          )}
        >
          {labels[level]}
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuRadioGroup value={level} onValueChange={onSelect}>
          {order.map((value) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <span
                aria-hidden
                className={cn("size-2 rounded-full", tones[value])}
              />
              {labels[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
