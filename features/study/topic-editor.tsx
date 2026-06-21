"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { CourseIcon } from "./course-icon";
import type { Importance, Topic, TopicLevel } from "./model";
import { useStudy } from "./study-store";

export function TopicEditor({
  topic,
  compact = false,
}: {
  topic: Topic;
  compact?: boolean;
}) {
  const { updateTopic } = useStudy();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<TopicLevel>(topic.level);
  const [importance, setImportance] = useState<Importance>(topic.importance);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateTopic({
      topicId: topic.id,
      level,
      importance,
      nextAction: String(formData.get("nextAction") ?? "").trim(),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="pointer-events-none opacity-0 transition-opacity group-hover/topic:pointer-events-auto group-hover/topic:opacity-100 group-focus-within/topic:pointer-events-auto group-focus-within/topic:opacity-100"
            aria-label={`עריכת ${topic.name}`}
          >
            <PencilIcon />
          </Button>
        ) : (
          <Button variant="ghost" className="min-w-0 max-w-full justify-start">
            <CourseIcon courseId={topic.courseId} data-icon="inline-start" />
            <span className="truncate">{topic.name}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{topic.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="contents">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${topic.id}-level`}>רמה</FieldLabel>
              <Select value={level} onValueChange={(value) => setLevel(value as TopicLevel)}>
                <SelectTrigger id={`${topic.id}-level`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="not-started">טרם התחיל</SelectItem>
                    <SelectItem value="weak">חלש</SelectItem>
                    <SelectItem value="learning">בלמידה</SelectItem>
                    <SelectItem value="strong">חזק</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${topic.id}-importance`}>חשיבות</FieldLabel>
              <Select value={importance} onValueChange={(value) => setImportance(value as Importance)}>
                <SelectTrigger id={`${topic.id}-importance`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="normal">רגילה</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${topic.id}-next-action`}>הפעולה הבאה</FieldLabel>
              <Input
                id={`${topic.id}-next-action`}
                name="nextAction"
                defaultValue={topic.nextAction}
                maxLength={120}
                placeholder="לא חובה"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">שמירה</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
