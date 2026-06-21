import {
  BookOpenIcon,
  BracesIcon,
  ChartColumnIcon,
  CpuIcon,
  Grid3x3Icon,
  ShapesIcon,
  SigmaIcon,
  type LucideIcon,
} from "lucide-react";

import { createElement, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  "low-level-languages": CpuIcon,
  "mathematical-logic": SigmaIcon,
  "discrete-mathematics": ShapesIcon,
  "programming-2": BracesIcon,
  "linear-algebra": Grid3x3Icon,
  "probability-statistics": ChartColumnIcon,
};

export function courseIcon(courseId: string): LucideIcon {
  return icons[courseId] ?? BookOpenIcon;
}

export function CourseIcon({
  courseId,
  className,
  ...props
}: { courseId: string } & ComponentProps<LucideIcon>) {
  return createElement(courseIcon(courseId), {
    className: cn("text-primary", className),
    ...props,
  });
}
