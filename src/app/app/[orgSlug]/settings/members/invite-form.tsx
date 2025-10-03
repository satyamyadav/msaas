"use client";

import { useActionState } from "react";

import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@components/ui/alert";

import { initialInviteFormState, inviteMemberAction } from "./actions";

export function InviteMemberForm({ organizationSlug }: { organizationSlug: string }) {
  const [state, formAction] = useActionState(inviteMemberAction, initialInviteFormState);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="grid gap-4 md:grid-cols-3">
          <input type="hidden" name="organizationSlug" value={organizationSlug} />
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="teammate@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="h-9 rounded border border-input bg-background px-3 text-sm"
              defaultValue="MEMBER"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Send invite</Button>
          </div>
          {state.status === "error" ? (
            <div className="md:col-span-3">
              <Alert variant="destructive">
                <AlertTitle>Unable to send invite</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </div>
          ) : null}
          {state.status === "success" ? (
            <div className="md:col-span-3">
              <Alert>
                <AlertTitle>Invite sent</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
