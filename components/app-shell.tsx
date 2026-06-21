"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "לימודים" },
  { href: "/courses", label: "קורסים" },
  { href: "/topics", label: "נושאים" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-background/95">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-end px-4 sm:px-6">
          <nav aria-label="ניווט ראשי" className="absolute left-1/2 flex h-full -translate-x-1/2 items-center gap-7 sm:gap-10">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-full items-center text-sm text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="תפריט חשבון">
                <UserRoundIcon data-icon="inline-start" />
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings">הגדרות</Link>
                </DropdownMenuItem>
                <form action={logoutAction}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full">התנתקות</button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
