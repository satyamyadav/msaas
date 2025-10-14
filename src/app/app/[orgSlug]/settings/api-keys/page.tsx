import { formatDistanceToNow } from "date-fns";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";

import { listApiKeys } from "@lib/server/api-keys";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import { CreateApiKeyForm } from "./api-key-form";
import { revokeApiKeyAction } from "./actions";

type Params = Promise<{ orgSlug: string }>;

export default async function ApiKeysSettingsPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(orgSlug, user.id);
  if (!access) {
    return null;
  }

  const keys = await listApiKeys(access.organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">API keys</h1>
        <p className="text-sm text-muted-foreground">
          Generate scoped API access tokens for integrations and automation.
        </p>
      </div>
      <CreateApiKeyForm organizationSlug={orgSlug} />
      <Card>
        <CardHeader>
          <CardTitle>Existing keys</CardTitle>
          <CardDescription>Revoke keys that are no longer in use to preserve security.</CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length ? (
            <ul className="space-y-3 text-sm">
              {keys.map((key) => (
                <li key={key.id} className="flex items-center justify-between rounded border border-border/60 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{key.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {key.lastUsedAt
                        ? `Last used ${formatDistanceToNow(key.lastUsedAt, { addSuffix: true })}`
                        : "Never used"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {key.revokedAt ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="outline">Active</Badge>}
                    {!key.revokedAt ? (
                      <form action={revokeApiKeyAction}>
                        <input type="hidden" name="organizationSlug" value={orgSlug} />
                        <input type="hidden" name="apiKeyId" value={key.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No API keys generated yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
