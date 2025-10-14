import Link from "next/link";

import { formatDistanceToNow } from "date-fns";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";

import { listLinks } from "@lib/server/links";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import { CreateLinkForm } from "./links/create-link-form";

type Params = Promise<{ orgSlug: string }>;

export default async function LinksHome({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(orgSlug, user.id);
  if (!access) {
    return null;
  }

  const links = await listLinks({ organizationId: access.organization.id });

  return (
    <div className="flex flex-col gap-6">
      <CreateLinkForm organizationSlug={orgSlug} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All links</CardTitle>
            <CardDescription>Manage slugs, update destinations, and monitor performance.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/app/${orgSlug}/analytics`}>View analytics</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {links.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Slug</th>
                    <th className="px-3 py-2 font-semibold">Destination</th>
                    <th className="px-3 py-2 font-semibold">Clicks</th>
                    <th className="px-3 py-2 font-semibold">Tags</th>
                    <th className="px-3 py-2 font-semibold">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {links.map((link) => (
                    <tr key={link.id} className="align-top">
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{link.slug}</span>
                          <span className="text-xs text-muted-foreground">/r/{link.slug}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <a href={link.destinationUrl} className="line-clamp-2 text-xs text-primary underline" target="_blank" rel="noreferrer">
                          {link.destinationUrl}
                        </a>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>
                            <strong className="text-base text-foreground">{link.clickCount}</strong> clicks
                          </span>
                          <span>{link.uniqueVisitors} visitors</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {link.tags.length ? (
                            link.tags.map((tag) => (
                              <Badge key={tag.tagId} variant="outline">
                                {tag.tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {link.lastClickedAt
                          ? `Clicked ${formatDistanceToNow(link.lastClickedAt, { addSuffix: true })}`
                          : `Created ${formatDistanceToNow(link.createdAt, { addSuffix: true })}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No links yet—use the form above to create your first short link.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
