"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdminUser, requireSuperAdminUser } from "@/lib/server/admin-auth";
import { PlatformRole, UserStatus } from "@prisma/client";
import { createSession, setUserPassword } from "@modules/auth/lib/auth-service";

function parseUserId(formData: FormData) {
  const id = formData.get("userId");
  if (typeof id !== "string" || !id) {
    throw new Error("USER_ID_REQUIRED");
  }
  return id;
}

export async function updateUserStatusAction(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = parseUserId(formData);
  const statusValue = formData.get("status");
  if (
    typeof statusValue !== "string" ||
    !Object.values(UserStatus).includes(statusValue as UserStatus)
  ) {
    throw new Error("INVALID_STATUS");
  }
  const status = statusValue as UserStatus;

  const targetUser = await prisma.authUser.findUnique({
    where: { id: userId },
    select: { id: true, platformRole: true },
  });

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND");
  }

  if (
    targetUser.platformRole === PlatformRole.SUPER_ADMIN &&
    currentUser.platformRole !== PlatformRole.SUPER_ADMIN
  ) {
    throw new Error("NOT_AUTHORIZED_SUPER_ADMIN_STATUS");
  }

  await prisma.authUser.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await requireSuperAdminUser();
  const userId = parseUserId(formData);
  const roleValue = formData.get("platformRole");
  if (
    typeof roleValue !== "string" ||
    !Object.values(PlatformRole).includes(roleValue as PlatformRole)
  ) {
    throw new Error("INVALID_ROLE");
  }
  const platformRole = roleValue as PlatformRole;

  const targetUser = await prisma.authUser.findUnique({
    where: { id: userId },
    select: { id: true, platformRole: true },
  });

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND");
  }

  if (targetUser.id === currentUser.id && platformRole !== PlatformRole.SUPER_ADMIN) {
    throw new Error("CANNOT_DEMOTE_SELF");
  }

  if (
    targetUser.platformRole === PlatformRole.SUPER_ADMIN &&
    platformRole !== PlatformRole.SUPER_ADMIN
  ) {
    const superAdminCount = await prisma.authUser.count({
      where: { platformRole: PlatformRole.SUPER_ADMIN },
    });

    if (superAdminCount <= 1) {
      throw new Error("CANNOT_REMOVE_LAST_SUPER_ADMIN");
    }
  }

  await prisma.authUser.update({
    where: { id: userId },
    data: { platformRole },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function resetUserPasswordAction(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = parseUserId(formData);
  const password = formData.get("newPassword");
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const targetUser = await prisma.authUser.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  });

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND");
  }

  if (
    targetUser.platformRole === PlatformRole.SUPER_ADMIN &&
    currentUser.platformRole !== PlatformRole.SUPER_ADMIN
  ) {
    throw new Error("NOT_AUTHORIZED_SUPER_ADMIN_PASSWORD");
  }

  await setUserPassword(userId, password);

  revalidatePath(`/admin/users/${userId}`);
}

export async function impersonateUserAction(formData: FormData) {
  await requireAdminUser();
  const userId = parseUserId(formData);
  await createSession(userId);
  redirect("/app");
}
