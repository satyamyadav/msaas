import { addDays } from "date-fns";

import { MemberRole, MemberStatus, InviteStatus } from "@prisma/client";

import { prisma } from "@lib/db";
import { randomId } from "@lib/utils";

import { markChecklistStep, recordOrganizationActivity } from "./organizations";

type CreateInviteInput = {
  organizationId: string;
  email: string;
  role: MemberRole;
  invitedById: string;
  expiresInDays?: number;
};

export async function createInvite({ organizationId, email, role, invitedById, expiresInDays = 14 }: CreateInviteInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const token = randomId(24);
  const expiresAt = addDays(new Date(), expiresInDays);

  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      user: {
        email: normalizedEmail,
      },
    },
  });

  if (existingMember) {
    throw new Error("INVITE_USER_ALREADY_MEMBER");
  }

  const existingInvite = await prisma.organizationInvite.findFirst({
    where: {
      organizationId,
      email: normalizedEmail,
      status: InviteStatus.PENDING,
    },
  });

  if (existingInvite) {
    const refreshed = await prisma.organizationInvite.update({
      where: { id: existingInvite.id },
      data: {
        role,
        invitedById,
        expiresAt,
        token,
      },
    });

    await recordOrganizationActivity(organizationId, invitedById, "invite.resent", `Invite re-sent to ${normalizedEmail}`);
    return refreshed;
  }

  const invite = await prisma.organizationInvite.create({
    data: {
      organizationId,
      email: normalizedEmail,
      role,
      invitedById,
      token,
      expiresAt,
      status: InviteStatus.PENDING,
    },
  });

  await recordOrganizationActivity(organizationId, invitedById, "invite.created", `Invite sent to ${normalizedEmail}`);
  return invite;
}

type AcceptInviteResult = {
  organizationId: string;
  organizationSlug: string;
  membershipId: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function acceptInvite(token: string, userId: string, userEmail: string): Promise<AcceptInviteResult> {
  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new Error("INVITE_NOT_FOUND");
  }

  if (normalizeEmail(invite.email) !== normalizeEmail(userEmail)) {
    throw new Error("INVITE_EMAIL_MISMATCH");
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new Error("INVITE_ALREADY_USED");
  }

  if (invite.expiresAt < new Date()) {
    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.EXPIRED,
      },
    });
    throw new Error("INVITE_EXPIRED");
  }

  const membership = await prisma.$transaction(async (tx) => {
    const newMembership = await tx.organizationMember.create({
      data: {
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
        status: MemberStatus.ACTIVE,
        invitedByInviteId: invite.id,
      },
      include: {
        organization: true,
      },
    });

    await tx.organizationInvite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.ACCEPTED,
        acceptedById: userId,
      },
    });

    await markChecklistStep(invite.organizationId, "invitedTeam");
    await recordOrganizationActivity(invite.organizationId, userId, "invite.accepted", `Invite accepted by ${invite.email}`);

    return newMembership;
  });

  return {
    organizationId: invite.organizationId,
    organizationSlug: membership.organization.slug,
    membershipId: membership.id,
  };
}

export async function revokeInvite(inviteId: string, actorId: string) {
  const invite = await prisma.organizationInvite.update({
    where: { id: inviteId },
    data: {
      status: InviteStatus.REVOKED,
    },
  });

  await recordOrganizationActivity(invite.organizationId, actorId, "invite.revoked", `Invite revoked for ${invite.email}`);
}
