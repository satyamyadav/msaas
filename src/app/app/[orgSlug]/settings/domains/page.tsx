import { formatDistanceToNow } from "date-fns";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";

import { listOrganizationDomains } from "@lib/server/domains";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import { deleteDomainAction } from "./actions";
import { DomainRequestForm } from "./domain-form";

type Params = Promise<{ orgSlug: string }>;

const STATUS_COPY: Record<string, string> = {
  PENDING: "Pending verification",
  VERIFYING: "Verifying",
  VERIFIED: "Verified",
  FAILED: "Verification failed",
};

export default async function DomainsSettingsPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(orgSlug, user.id);
  if (!access) {
    return null;
  }

  const domains = await listOrganizationDomains(access.organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Custom domains</h1>
        <p className="text-sm text-muted-foreground">
          Map branded domains to your short links. Pro plans support up to three custom domains.
        </p>
      </div>
      <DomainRequestForm organizationSlug={orgSlug} />
      <Card>
        <CardHeader>
          <CardTitle>Active domains</CardTitle>
          <CardDescription>Ensure your DNS records point to our redirect edge.</CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length ? (
            <ul className="space-y-3 text-sm">
              {domains.map((domain) => (
                <li key={domain.id} className="flex items-center justify-between rounded border border-border/60 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{domain.domain}</span>
                    <span className="text-xs text-muted-foreground">
                      Added {formatDistanceToNow(domain.createdAt, { addSuffix: true })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Verification token: <code className="rounded bg-muted px-1">{domain.verificationToken}</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{STATUS_COPY[domain.status] ?? domain.status}</Badge>
                    <form action={deleteDomainAction}>
                      <input type="hidden" name="organizationSlug" value={orgSlug} />
                      <input type="hidden" name="domainId" value={domain.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No custom domains yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
