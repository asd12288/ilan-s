import type { ReactNode } from "react";

export function PageHeader({
  title,
  icon,
}: {
  title: string;
  icon?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-center gap-3 sm:mb-8">
      {icon}
      <h1 className="text-2xl font-semibold tracking-[-0.025em] sm:text-[2rem] sm:leading-tight">
        {title}
      </h1>
    </header>
  );
}
