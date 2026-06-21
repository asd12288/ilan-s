"use client";

import { ChevronDownIcon } from "lucide-react";

import { badgeVariants } from "@/components/ui/badge";
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
  "not-started": "טרם התחיל",
  weak: "חלש",
  learning: "בלמידה",
  strong: "חזק",
};

const tones: Record<TopicLevel, string> = {
  "not-started": "bg-status-not-started",
  weak: "bg-status-weak",
  learning: "bg-status-learning",
  strong: "bg-status-strong",
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
            badgeVariants({ variant: "ghost" }),
            "gap-2 px-1 text-muted-foreground",
          )}
        >
          <span aria-hidden className={cn("size-2 rounded-full", tones[level])} />
          {labels[level]}
          <ChevronDownIcon className="text-muted-foreground" />
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
