"use server";

import { revalidatePath } from "next/cache";

import { createApiKey, revokeApiKey } from "@lib/server/api-keys";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export type ApiKeyFormState =
  | { status: "idle" }
  | { status: "success"; secret: string }
  | { status: "error"; message: string };

export async function createApiKeyAction(_: ApiKeyFormState, formData: FormData): Promise<ApiKeyFormState> {
  const slug = formData.get("organizationSlug");
  const label = formData.get("label");

  if (typeof slug !== "string" || !slug) {
    return { status: "error", message: "Workspace not found." };
  }

  if (typeof label !== "string" || !label.trim()) {
    return { status: "error", message: "Name your API key." };
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
    return { status: "error", message: "You do not have permission to manage API keys." };
  }

  const key = await createApiKey({
    organizationId: access.organization.id,
    actorMembershipId: access.membership.id,
    label: label.trim(),
  });

  revalidatePath(`/app/${slug}/settings/api-keys`);

  return {
    status: "success",
    secret: key.secret,
  };
}

export async function revokeApiKeyAction(formData: FormData) {
  const slug = formData.get("organizationSlug");
  const keyId = formData.get("apiKeyId");

  if (typeof slug !== "string" || typeof keyId !== "string") {
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

  await revokeApiKey(keyId, access.membership.id);
  revalidatePath(`/app/${slug}/settings/api-keys`);
}
