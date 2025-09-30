"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { signInAction, signUpAction, type AuthFormState } from "@modules/auth/actions";
import { authFormInitialState } from "@modules/auth/state";

type SignInFormProps = {
  mode: "login" | "register";
  redirectTo: string;
};

function SubmitButton({ label }: { label: string }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={status.pending}
    >
      {status.pending ? "Please wait…" : label}
    </button>
  );
}

export function SignInForm({ mode, redirectTo }: SignInFormProps) {
  const action = mode === "register" ? signUpAction : signInAction;
  const [state, formAction] = useFormState<AuthFormState, FormData>(action, authFormInitialState);

  const isRegister = mode === "register";
  const toggleHref = isRegister
    ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
    : `/sign-in?mode=register&redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <header className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">@msaas/auth</p>
        <h2 className="text-2xl font-bold">{isRegister ? "Create your workspace" : "Sign in to your workspace"}</h2>
        <p className="text-sm text-muted-foreground">
          {isRegister
            ? "Set up your account with a password to access the modular SaaS dashboard."
            : "Enter your credentials to continue where you left off."}
        </p>
      </header>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="email"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={8}
          />
        </label>
        {isRegister ? (
          <label className="space-y-2">
            <span className="text-sm font-medium">Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="new-password"
              minLength={8}
            />
          </label>
        ) : null}
        {state.status === "error" ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        ) : null}
        <SubmitButton label={isRegister ? "Create account" : "Continue"} />
      </form>
      <p className="text-center text-xs text-muted-foreground">
        {isRegister ? "Already have an account? " : "Need an account? "}
        <Link href={toggleHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {isRegister ? "Sign in" : "Create one"}
        </Link>
        .
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Powered by a pluggable module. Want to customize it? <Link href="/docs/ejection" className="underline">Eject the module</Link>.
      </p>
    </div>
  );
}
