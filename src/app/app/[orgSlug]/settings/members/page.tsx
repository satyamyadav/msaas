import { formatDistanceToNow } from "date-fns";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";

import { prisma } from "@lib/db";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import { InviteMemberForm } from "./invite-form";
import { revokeInviteAction } from "./actions";

export default async function MembersSettingsPage({ params }: { params: { orgSlug: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(params.orgSlug, user.id);
  if (!access) {
    return null;
  }

  const [members, invites] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId: access.organization.id },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.organizationInvite.findMany({
      where: {
        organizationId: access.organization.id,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Workspace members</h1>
        <p className="text-sm text-muted-foreground">Invite teammates and manage access levels.</p>
      </div>
      <InviteMemberForm organizationSlug={params.orgSlug} />
      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>Members with access to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{member.user.displayName ?? member.user.email}</span>
                        <span className="text-xs text-muted-foreground">{member.user.email}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{member.role}</Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(member.joinedAt, { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>Invites waiting for acceptance.</CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length ? (
            <ul className="space-y-3 text-sm">
              {invites.map((invite) => (
                <li key={invite.id} className="flex items-center justify-between rounded border border-border/60 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{invite.email}</span>
                    <span className="text-xs text-muted-foreground">Expires {formatDistanceToNow(invite.expiresAt, { addSuffix: true })}</span>
                  </div>
                  <form action={revokeInviteAction}>
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <input type="hidden" name="organizationSlug" value={params.orgSlug} />
                    <Button type="submit" variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
