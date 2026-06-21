export function daysUntil(date: string, now = new Date()): number {
  return Math.max(0, Math.ceil((Date.parse(date) - now.getTime()) / 86_400_000));
}

export function formatExamDate(date: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}
