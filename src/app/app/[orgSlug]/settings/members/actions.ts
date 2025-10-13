"use server";

import { revalidatePath } from "next/cache";

import { MemberRole } from "@prisma/client";

import { createInvite, revokeInvite } from "@lib/server/invitations";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

import type { InviteFormState } from "./state";

export async function inviteMemberAction(_: InviteFormState, formData: FormData): Promise<InviteFormState> {
  const slug = formData.get("organizationSlug");
  const email = formData.get("email");
  const roleValue = formData.get("role");

  if (typeof slug !== "string" || !slug) {
    return { status: "error", message: "Workspace not found." };
  }

  if (typeof email !== "string" || !email) {
    return { status: "error", message: "Email address is required." };
  }

  const role =
    typeof roleValue === "string" && (Object.values(MemberRole) as string[]).includes(roleValue)
      ? (roleValue as MemberRole)
      : MemberRole.MEMBER;

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sign in required." };
  }

  const access = await getOrganizationBySlugForUser(slug, user.id);
  if (!access) {
    return { status: "error", message: "Workspace not found." };
  }

  if (access.membership.role === "VIEWER") {
    return { status: "error", message: "You do not have permission to invite members." };
  }

  try {
    await createInvite({
      organizationId: access.organization.id,
      email,
      role,
      invitedById: user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Unable to send invite." };
  }

  revalidatePath(`/app/${slug}/settings/members`);
  return { status: "success", message: "Invitation sent." };
}

export async function revokeInviteAction(formData: FormData) {
  const inviteId = formData.get("inviteId");
  const slug = formData.get("organizationSlug");

  if (typeof inviteId !== "string" || typeof slug !== "string") {
    return;
  }

  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const access = await getOrganizationBySlugForUser(slug, user.id);
  if (!access) {
    return;
  }

  await revokeInvite(inviteId, user.id);
  revalidatePath(`/app/${slug}/settings/members`);
}
