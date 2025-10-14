import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";

import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import { deleteOrganizationAction } from "./actions";
import { OrganizationProfileForm } from "./profile-form";

type Params = Promise<{ orgSlug: string }>;

export default async function OrganizationSettingsPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(orgSlug, user.id);
  if (!access) {
    return null;
  }

  const canDelete = access.membership.role === "OWNER";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Workspace settings</h1>
          <p className="text-sm text-muted-foreground">Update the public name and default metadata for this workspace.</p>
        </div>
        <OrganizationProfileForm
          organizationSlug={orgSlug}
          defaultName={access.organization.name}
          defaultPrimaryDomain={access.organization.primaryDomain ?? null}
        />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan details</CardTitle>
            <CardDescription>Your workspace is currently on the {access.organization.planTier} plan.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Manage billing and upgrades from the billing tab. Need a custom plan? Reach out to sales@msaastemplate.dev.
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <a href={`/app/${orgSlug}/settings/billing`}>Open billing</a>
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>Deleting a workspace will disable all associated links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert variant="destructive">
              <AlertTitle>Irreversible action</AlertTitle>
              <AlertDescription>
                This will soft-delete the workspace and pause all redirects. Contact support to restore if needed.
              </AlertDescription>
            </Alert>
            <form action={deleteOrganizationAction} className="flex flex-col gap-3">
              <input type="hidden" name="organizationSlug" value={orgSlug} />
              <Button type="submit" variant="destructive" disabled={!canDelete}>
                Delete workspace
              </Button>
              {!canDelete ? (
                <p className="text-xs text-muted-foreground">Only workspace owners can delete the workspace.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
