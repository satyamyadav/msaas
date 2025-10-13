import Link from "next/link";

import { ThemeToggle } from "@components/theme-toggle";
import { Button, buttonVariants } from "@components/ui/button";
import { cn } from "@lib/utils";
import { getOrganizationsForUser } from "@lib/server/organizations";
import { getCurrentUser, signOutAction } from "@modules/auth/actions";

export async function SiteHeader() {
  const sessionUser = await getCurrentUser();
  const organizations = sessionUser ? await getOrganizationsForUser(sessionUser.id) : [];
  const defaultOrgSlug = organizations[0]?.organization.slug;

  const navigation = sessionUser
    ? [
        { href: "/", label: "Overview" },
        { href: "/docs/getting-started", label: "Docs" },
        { href: "/pricing", label: "Pricing" },
        { href: defaultOrgSlug ? `/app/${defaultOrgSlug}` : "/app", label: "Dashboard" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">@</span>
          <span>Modular SaaS Starter</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(buttonVariants({ variant: "ghost" }), "px-3")}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          {sessionUser ? (
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
