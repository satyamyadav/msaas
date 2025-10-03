"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { adminSignInAction, type AdminAuthFormState } from "./actions";

const ADMIN_AUTH_FORM_INITIAL_STATE: AdminAuthFormState = { status: "idle" };

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} className="w-full">
      {status.pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

type AdminSignInFormProps = {
  redirectTo: string;
};

export function AdminSignInForm({ redirectTo }: AdminSignInFormProps) {
  const [state, formAction] = useActionState(adminSignInAction, ADMIN_AUTH_FORM_INITIAL_STATE);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle>Platform console</CardTitle>
        <CardDescription>Access the owner-facing admin tools for the SaaS platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-2">
            <Label htmlFor="email">Admin email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@example.com" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </div>
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
        <p>
          Trying to use the product? <Link href="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">Sign in as a workspace user</Link>.
        </p>
      </CardFooter>
    </Card>
  );
}
