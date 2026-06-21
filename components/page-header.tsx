import type { ReactNode } from "react";

export function PageHeader({
  title,
  icon,
}: {
  title: string;
  icon?: ReactNode;
}) {
  return (
    <header className="mb-8 flex items-center gap-3 sm:mb-10">
      {icon}
      <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-[2.5rem] sm:leading-tight">
        {title}
      </h1>
    </header>
  );
}
