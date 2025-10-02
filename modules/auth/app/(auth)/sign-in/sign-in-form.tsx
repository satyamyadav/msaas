"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

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
};

function SubmitButton({ label }: { label: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} className="w-full">
      {status.pending ? "Please wait…" : label}
    </Button>
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
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle>{isRegister ? "Create your workspace" : "Sign in to your workspace"}</CardTitle>
        <CardDescription>
          {isRegister
            ? "Set up your account with a password to access the modular SaaS dashboard."
            : "Enter your credentials to continue where you left off."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="you@example.com" required autoComplete="email" />
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
