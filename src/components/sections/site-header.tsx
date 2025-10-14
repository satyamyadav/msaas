import Link from "next/link";
import { Link2 } from "lucide-react";
import { buttonVariants } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ThemeToggle } from "@components/theme-toggle";
import { getOrganizationsForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const sessionUser = await getCurrentUser();
  const organizations = sessionUser ? await getOrganizationsForUser(sessionUser.id) : [];
  const defaultOrgSlug = organizations[0]?.organization.slug;

  const dashboardHref = sessionUser
    ? defaultOrgSlug
      ? `/app/${defaultOrgSlug}`
      : "/app"
    : undefined;

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold">UrlCraft</span>
            <span className="text-xs font-medium text-muted-foreground">Short links. Bigger reach.</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {sessionUser ? (
            <UserMenu
              user={{ name: sessionUser.displayName, email: sessionUser.email }}
              dashboardHref={dashboardHref}
            />
          ) : (
            <Link href="/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
