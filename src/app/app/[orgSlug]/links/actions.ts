"use server";

import { revalidatePath } from "next/cache";

import { createLink } from "@lib/server/links";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export type LinkFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function createLinkAction(_: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const organizationSlug = formData.get("organizationSlug");
  const destinationUrl = formData.get("destinationUrl");
  const customSlug = formData.get("slug");
  const tagsValue = formData.get("tags");

  if (typeof organizationSlug !== "string" || !organizationSlug) {
    return { status: "error", message: "Organization slug missing." };
  }

  if (typeof destinationUrl !== "string" || !destinationUrl.trim()) {
    return { status: "error", message: "Destination URL is required." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sign in required." };
  }

  const access = await getOrganizationBySlugForUser(organizationSlug, user.id);
  if (!access) {
    return { status: "error", message: "Organization not found." };
  }

  try {
    await createLink({
      organizationId: access.organization.id,
      membershipId: access.membership.id,
      destinationUrl: destinationUrl.trim(),
      slug: typeof customSlug === "string" && customSlug ? customSlug : undefined,
      tags: typeof tagsValue === "string" && tagsValue.trim()
        ? tagsValue
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Unable to create link. Please try again." };
  }

  revalidatePath(`/app/${organizationSlug}/links`);

  return { status: "success", message: "Short link created." };
}
