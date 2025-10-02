"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createOrganizationWithOwner } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export async function createOrganizationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent("/app/new")}`);
  }

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Organization name is required.");
  }

  const organization = await createOrganizationWithOwner({
    userId: user.id,
    name: name.trim(),
  });

  revalidatePath("/app");
  redirect(`/app/${organization.slug}`);
}
