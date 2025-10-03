"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { signInAction, signUpAction, type AuthFormState } from "@modules/auth/actions";
import { authFormInitialState } from "@modules/auth/state";

type SignInFormProps = {
  mode: "login" | "register";
  redirectTo: string;
  inviteToken?: string;
  email?: string;
};

function SubmitButton({ label }: { label: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} className="w-full">
      {status.pending ? "Please wait…" : label}
    </Button>
  );
}

export function SignInForm({ mode, redirectTo, inviteToken, email }: SignInFormProps) {
  const action = mode === "register" ? signUpAction : signInAction;
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, authFormInitialState);

  const isRegister = mode === "register";
  const params = new URLSearchParams({ redirectTo });
  if (inviteToken) {
    params.set("invite", inviteToken);
  }
  if (email) {
    params.set("email", email);
  }
  const query = params.toString();

  const toggleHref = isRegister ? `/sign-in?${query}` : `/sign-in?mode=register&${query}`;
  const inviteActive = Boolean(inviteToken);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle>
          {isRegister ? (inviteActive ? "Claim your invitation" : "Create your workspace") : "Sign in to your workspace"}
        </CardTitle>
        <CardDescription>
          {isRegister
            ? inviteActive
              ? "Finish setting up your account to join the team that invited you."
              : "Set up your account with a password to access the modular SaaS dashboard."
            : "Enter your credentials to continue where you left off."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          {inviteToken ? <input type="hidden" name="inviteToken" value={inviteToken} /> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              defaultValue={email}
              readOnly={Boolean(email && inviteActive)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
            />
          </div>
          {isRegister ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          ) : null}
          {isRegister ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Ada Lovelace"
                autoComplete="name"
              />
            </div>
          ) : null}
          {isRegister && !inviteActive ? (
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization name</Label>
              <Input
                id="organizationName"
                name="organizationName"
                placeholder="Acme Analytics"
                required
              />
            </div>
          ) : null}
          {inviteActive ? (
            <Alert>
              <AlertTitle>You're invited</AlertTitle>
              <AlertDescription>
                Complete your account to join the workspace. If you already have an account with this email, simply switch to
                sign in.
              </AlertDescription>
            </Alert>
          ) : null}
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to continue</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <SubmitButton label={isRegister ? "Create account" : "Continue"} />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
        <p>
          {isRegister ? "Already have an account? " : "Need an account? "}
          <Link href={toggleHref} className="font-medium text-primary underline-offset-4 hover:underline">
            {isRegister ? "Sign in" : "Create one"}
          </Link>
          .
        </p>
        <p>
          Powered by a pluggable module. Want to customize it? <Link href="/docs/ejection" className="underline">Eject the module</Link>.
        </p>
      </CardFooter>
    </Card>
  );
}
