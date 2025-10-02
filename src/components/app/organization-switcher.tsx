"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";

import { useActiveOrganization } from "./active-organization-context";
import { useAppContext } from "./app-context";

export function OrganizationSwitcher() {
  const { organizations } = useAppContext();
  const { organization } = useActiveOrganization();
  const pathname = usePathname();

  if (!organizations.length) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold uppercase">
            {organization.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-sm font-medium">{organization.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((entry) => {
          const href = `/app/${entry.organization.slug}`;
          const isActive = pathname?.startsWith(href);
          return (
            <DropdownMenuItem key={entry.organization.id} asChild>
              <Link href={href} className={cn("flex w-full items-center gap-2", isActive && "text-primary")}> 
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold uppercase">
                  {entry.organization.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="truncate text-sm">{entry.organization.name}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/new" className="text-sm text-muted-foreground">
            + Create new workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
