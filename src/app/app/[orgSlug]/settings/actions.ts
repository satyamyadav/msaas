"use server";

import { revalidatePath } from "next/cache";

import { updateOrganizationSettings, softDeleteOrganization, getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export type SettingsFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const initialSettingsFormState: SettingsFormState = { status: "idle" };

export async function updateOrganizationProfileAction(_: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const slug = formData.get("organizationSlug");
  const name = formData.get("name");
  const primaryDomain = formData.get("primaryDomain");

  if (typeof slug !== "string" || !slug) {
    return { status: "error", message: "Missing organization identifier." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sign in required." };
  }

  const access = await getOrganizationBySlugForUser(slug, user.id);
  if (!access) {
    return { status: "error", message: "Organization not found." };
  }

  if (access.membership.role !== "OWNER" && access.membership.role !== "ADMIN") {
    return { status: "error", message: "Only admins can update workspace settings." };
  }

  try {
    await updateOrganizationSettings({
      organizationId: access.organization.id,
      name: typeof name === "string" && name.trim() ? name.trim() : undefined,
      primaryDomain: typeof primaryDomain === "string" && primaryDomain.trim() ? primaryDomain.trim() : null,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Unable to update workspace." };
  }

  revalidatePath(`/app/${slug}/settings`);
  return { status: "success", message: "Workspace updated." };
}

export async function deleteOrganizationAction(formData: FormData) {
  const slug = formData.get("organizationSlug");
  if (typeof slug !== "string" || !slug) {
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

  if (access.membership.role !== "OWNER") {
    return;
  }

  await softDeleteOrganization(access.organization.id);
  revalidatePath("/app");
  redirect("/app");
}
