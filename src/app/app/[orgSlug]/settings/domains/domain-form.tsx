"use client";

import { useActionState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { requestDomainAction } from "./actions";
import type { DomainFormState } from "./actions";

const initialState: DomainFormState = { status: "idle" };

export function DomainRequestForm({ organizationSlug }: { organizationSlug: string }) {
  const [state, formAction] = useActionState(requestDomainAction, initialState);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="organizationSlug" value={organizationSlug} />
          <div className="space-y-2">
            <Label htmlFor="domain">Custom domain</Label>
            <Input id="domain" name="domain" placeholder="links.example.com" required />
            <p className="text-xs text-muted-foreground">We&apos;ll generate a verification token once submitted.</p>
          </div>
          <Button type="submit" className="w-fit">
            Request domain
          </Button>
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to request domain</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "success" ? (
            <Alert>
              <AlertTitle>Domain registered</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
