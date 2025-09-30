import Link from "next/link";
import { notFound } from "next/navigation";

import { getModuleCopy, isFeatureEnabled } from "@lib/feature-flags";

export const metadata = {
  title: "Sign in",
};

export default function AuthSignInPage() {
  if (!isFeatureEnabled("auth")) {
    notFound();
  }

  const moduleMeta = getModuleCopy("auth");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {moduleMeta.displayName}
        </p>
        <h1 className="mt-2 text-4xl font-bold">Secure sign-in experience</h1>
        <p className="mt-3 max-w-2xl text-balance text-base text-muted-foreground">
          {moduleMeta.description}
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
        <header className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">@msaas/auth</p>
          <h2 className="text-2xl font-bold">Sign in to your workspace</h2>
          <p className="text-sm text-muted-foreground">
            This stub demonstrates how an ejectable authentication module would surface UI into the host application.
          </p>
        </header>
        <form className="flex flex-col gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Continue
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Powered by a pluggable module. Want to customize it? <Link href="/docs/ejection" className="underline">Eject the module</Link>.
        </p>
      </div>
    </main>
  );
}
