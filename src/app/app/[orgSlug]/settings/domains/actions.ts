"use server";

import { revalidatePath } from "next/cache";

import { requestCustomDomain, deleteCustomDomain } from "@lib/server/domains";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export type DomainFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const initialDomainFormState: DomainFormState = { status: "idle" };

export async function requestDomainAction(_: DomainFormState, formData: FormData): Promise<DomainFormState> {
  const slug = formData.get("organizationSlug");
  const domain = formData.get("domain");

  if (typeof slug !== "string" || !slug) {
    return { status: "error", message: "Workspace not found." };
  }

  if (typeof domain !== "string" || !domain.trim()) {
    return { status: "error", message: "Enter a domain." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sign in required." };
  }

  const access = await getOrganizationBySlugForUser(slug, user.id);
  if (!access) {
    return { status: "error", message: "Workspace not found." };
  }

  if (access.membership.role === "VIEWER") {
    return { status: "error", message: "You do not have permission to manage domains." };
  }

  try {
    await requestCustomDomain({
      organizationId: access.organization.id,
      domain,
      actorId: user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Unable to request domain." };
  }

  revalidatePath(`/app/${slug}/settings/domains`);
  return { status: "success", message: "Domain request saved." };
}

export async function deleteDomainAction(formData: FormData) {
  const slug = formData.get("organizationSlug");
  const domainId = formData.get("domainId");

  if (typeof slug !== "string" || typeof domainId !== "string") {
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

  if (access.membership.role === "VIEWER") {
    return;
  }

  await deleteCustomDomain(domainId, user.id);
  revalidatePath(`/app/${slug}/settings/domains`);
}
