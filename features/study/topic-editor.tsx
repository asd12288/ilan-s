"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon, XIcon } from "lucide-react";

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
  const { updateTopic, addSubtopic, removeSubtopic } = useStudy();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<TopicLevel>(topic.level);
  const [importance, setImportance] = useState<Importance>(topic.importance);
  const [newSubtopic, setNewSubtopic] = useState("");

  const subtopics = topic.subtopics.toSorted((a, b) => a.position - b.position);

  function onAddSubtopic() {
    const name = newSubtopic.trim();
    if (!name) return;
    addSubtopic(topic.id, crypto.randomUUID(), name);
    setNewSubtopic("");
  }

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
                    <SelectItem value="not-started">לא התחלתי</SelectItem>
                    <SelectItem value="weak">צריך חיזוק</SelectItem>
                    <SelectItem value="learning">בלמידה</SelectItem>
                    <SelectItem value="strong">שולט</SelectItem>
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
            <Field>
              <FieldLabel htmlFor={`${topic.id}-add-subtopic`}>תתי-נושאים</FieldLabel>
              {subtopics.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {subtopics.map((subtopic) => (
                    <li
                      key={subtopic.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 ps-3 pe-1 py-1 text-sm"
                    >
                      <span className="truncate">{subtopic.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`מחיקת ${subtopic.name}`}
                        onClick={() => removeSubtopic(topic.id, subtopic.id)}
                      >
                        <XIcon />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                <Input
                  id={`${topic.id}-add-subtopic`}
                  value={newSubtopic}
                  onChange={(event) => setNewSubtopic(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onAddSubtopic();
                    }
                  }}
                  maxLength={100}
                  placeholder="הוספת תת-נושא"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="הוספת תת-נושא"
                  onClick={onAddSubtopic}
                  disabled={newSubtopic.trim() === ""}
                >
                  <PlusIcon />
                </Button>
              </div>
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
