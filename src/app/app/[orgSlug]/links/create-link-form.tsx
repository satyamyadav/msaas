"use client";

import { useEffect } from "react";
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

import { createLinkAction, initialLinkFormState } from "./actions";

export function CreateLinkForm({ organizationSlug }: { organizationSlug: string }) {
  const [state, formAction] = useFormState(createLinkAction, initialLinkFormState);

  useEffect(() => {
    if (state.status === "success") {
      const form = document.querySelector<HTMLFormElement>("#create-link-form");
      form?.reset();
    }
  }, [state.status]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form id="create-link-form" action={formAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="organizationSlug" value={organizationSlug} />
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="destinationUrl">Destination URL</Label>
            <Input id="destinationUrl" name="destinationUrl" type="url" placeholder="https://example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Custom slug</Label>
            <Input id="slug" name="slug" placeholder="product-launch" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="marketing, q1" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Create short link</Button>
          </div>
          {state.status === "error" ? (
            <div className="md:col-span-2">
              <Alert variant="destructive">
                <AlertTitle>Unable to create link</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </div>
          ) : null}
          {state.status === "success" ? (
            <div className="md:col-span-2">
              <Alert>
                <AlertTitle>Link ready</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
