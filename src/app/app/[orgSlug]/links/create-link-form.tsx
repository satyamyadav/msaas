"use client";

import { useActionState, useEffect, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { createLinkAction } from "./actions";
import type { LinkFormState } from "./actions";

const initialState: LinkFormState = { status: "idle" };

export function CreateLinkForm({ organizationSlug }: { organizationSlug: string }) {
  const [state, formAction] = useActionState(createLinkAction, initialState);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (state.status === "success") {
      const form = document.querySelector<HTMLFormElement>("#create-link-form");
      form?.reset();

      if (typeof window !== "undefined") {
        const origin = window.location.origin.replace(/\/$/, "");
        const url = state.link.domain
          ? `https://${state.link.domain}/${state.link.slug}`
          : `${origin}/r/${state.link.slug}`;
        setShortUrl(url);
      } else {
        setShortUrl(null);
      }
      setCopyStatus("idle");
    } else {
      setShortUrl(null);
    }
  }, [state]);

  async function handleCopy() {
    if (!shortUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shortUrl;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 2000);
      } catch {
        setCopyStatus("idle");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

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
                <AlertDescription className="space-y-3">
                  <p>{state.message}</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <code className="w-full rounded border border-border/60 bg-muted/40 px-3 py-2 font-mono text-sm text-foreground sm:w-auto">
                      {shortUrl ?? "Generating short link..."}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!shortUrl}
                    >
                      {copyStatus === "copied" ? "Copied!" : "Copy link"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
