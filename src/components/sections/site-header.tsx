import Link from "next/link";

import { getCurrentUser, signOutAction } from "@modules/auth/actions";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/sign-in", label: "Auth" },
  { href: "/billing", label: "Billing" },
];

export async function SiteHeader() {
  const sessionUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">@</span>
          <span>Modular SaaS Starter</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {sessionUser ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg px-3 py-2 font-medium text-foreground transition hover:bg-muted"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/sign-in?redirectTo=%2Fbilling"
              className="rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
