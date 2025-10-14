"use client";

import Link from "next/link";
import { useMemo, useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { cn } from "@lib/utils";
import { signOutAction } from "@modules/auth/actions";

type UserMenuProps = {
  user: {
    name: string | null;
    email: string;
  };
  dashboardHref?: string;
};

export function UserMenu({ user, dashboardHref }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  const initials = useMemo(() => {
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  }, [user.email, user.name]);

  const handleSignOut = () => {
    startTransition(() => {
      void signOutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold uppercase text-foreground transition",
            "hover:border-primary hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
          aria-label="Open user menu"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-tight">{user.name ?? user.email}</span>
          {user.name ? (
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardHref ? (
          <DropdownMenuItem asChild>
            <Link href={dashboardHref} className="flex w-full items-center gap-2">
              Workspace dashboard
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/app" className="flex w-full items-center gap-2">
            All workspaces
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleSignOut();
          }}
          disabled={isPending}
          className="text-destructive focus:text-destructive"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
