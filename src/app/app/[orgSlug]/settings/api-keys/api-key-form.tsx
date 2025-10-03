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

import { createApiKeyAction, initialApiKeyFormState } from "./actions";

export function CreateApiKeyForm({ organizationSlug }: { organizationSlug: string }) {
  const [state, formAction] = useActionState(createApiKeyAction, initialApiKeyFormState);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="organizationSlug" value={organizationSlug} />
          <div className="space-y-2">
            <Label htmlFor="label">Key label</Label>
            <Input id="label" name="label" placeholder="Zapier integration" required />
          </div>
          <Button type="submit" className="w-fit">
            Generate key
          </Button>
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to create key</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "success" ? (
            <Alert>
              <AlertTitle>API key generated</AlertTitle>
              <AlertDescription>
                Store this secret now: <code className="rounded bg-muted px-1">{state.secret}</code>
              </AlertDescription>
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
