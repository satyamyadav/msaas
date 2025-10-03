"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/lib/server/admin-auth";
import { OrganizationStatus, PlanTier } from "@prisma/client";

function parseOrganizationId(formData: FormData) {
  const id = formData.get("organizationId");
  if (typeof id !== "string" || !id) {
    throw new Error("ORGANIZATION_ID_REQUIRED");
  }
  return id;
}

export async function updateOrganizationStatusAction(formData: FormData) {
  await requireAdminUser();
  const organizationId = parseOrganizationId(formData);
  const statusValue = formData.get("status");
  if (
    typeof statusValue !== "string" ||
    !Object.values(OrganizationStatus).includes(statusValue as OrganizationStatus)
  ) {
    throw new Error("INVALID_STATUS");
  }
  const status = statusValue as OrganizationStatus;

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      status,
      suspendedAt: status === OrganizationStatus.SUSPENDED ? new Date() : null,
    },
  });

  revalidatePath("/admin/orgs");
  revalidatePath(`/admin/orgs/${organizationId}`);
}

export async function updateOrganizationPlanAction(formData: FormData) {
  await requireAdminUser();
  const organizationId = parseOrganizationId(formData);
  const planValue = formData.get("planTier");
  if (typeof planValue !== "string" || !Object.values(PlanTier).includes(planValue as PlanTier)) {
    throw new Error("INVALID_PLAN");
  }
  const planTier = planValue as PlanTier;

  await prisma.organization.update({
    where: { id: organizationId },
    data: { planTier },
  });

  revalidatePath("/admin/orgs");
  revalidatePath(`/admin/orgs/${organizationId}`);
}
