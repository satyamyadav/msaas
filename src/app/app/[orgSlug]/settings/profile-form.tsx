"use client";

import { useFormState } from "react-dom";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { initialSettingsFormState, updateOrganizationProfileAction } from "./actions";

export function OrganizationProfileForm({
  organizationSlug,
  defaultName,
  defaultPrimaryDomain,
}: {
  organizationSlug: string;
  defaultName: string;
  defaultPrimaryDomain: string | null;
}) {
  const [state, formAction] = useFormState(updateOrganizationProfileAction, initialSettingsFormState);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="organizationSlug" value={organizationSlug} />
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input id="name" name="name" defaultValue={defaultName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryDomain">Primary domain</Label>
            <Input
              id="primaryDomain"
              name="primaryDomain"
              defaultValue={defaultPrimaryDomain ?? ""}
              placeholder="links.example.com"
            />
            <p className="text-xs text-muted-foreground">Optional vanity domain displayed in share cards.</p>
          </div>
          <Button type="submit" className="w-fit">
            Save changes
          </Button>
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to update workspace</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "success" ? (
            <Alert>
              <AlertTitle>Workspace updated</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
