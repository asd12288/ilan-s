export function daysUntil(date: string, now = new Date()): number {
  return Math.max(0, Math.ceil((Date.parse(date) - now.getTime()) / 86_400_000));
}

export type ExamUrgency = "urgent" | "soon" | "normal";

export function examUrgency(days: number): ExamUrgency {
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "normal";
}

export function formatExamDate(date: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}
