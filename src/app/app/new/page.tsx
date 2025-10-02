import Link from "next/link";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { createOrganizationAction } from "../actions";

export default function CreateOrganizationPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center gap-6 px-6 py-12">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Create a new workspace</CardTitle>
          <CardDescription>Spin up an additional workspace to separate teams, clients, or environments.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createOrganizationAction} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" name="name" placeholder="Northwind Marketing" required />
            </div>
            <Button type="submit" className="w-full">
              Create workspace
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <span>Need help deciding on structure?</span>
          <Link href="/docs/workspaces" className="underline">
            Read the guide
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
