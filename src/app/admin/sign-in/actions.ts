"use server";

import { redirect } from "next/navigation";

import { authenticateUser, createSession } from "@modules/auth/lib/auth-service";
import type { AuthFormState } from "@modules/auth/actions";
import { PlatformRole, UserStatus } from "@prisma/client";

export type AdminAuthFormState = AuthFormState;

const allowedPlatformRoles = new Set<PlatformRole>([PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN]);

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function resolveRedirect(target: string | null | undefined) {
  const fallback = "/admin";
  if (!target) {
    return fallback;
  }
  if (!target.startsWith("/")) {
    return fallback;
  }
  if (target.startsWith("//")) {
    return fallback;
  }
  return target;
}

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function adminSignInAction(_: AdminAuthFormState, formData: FormData): Promise<AdminAuthFormState> {
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const redirectTo = resolveRedirect(getField(formData, "redirectTo"));

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!password) {
    return { status: "error", message: "Password is required." };
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return { status: "error", message: "Invalid email or password." };
  }

  if (user.status !== UserStatus.ACTIVE) {
    return { status: "error", message: "Your account is not active." };
  }

  if (!allowedPlatformRoles.has(user.platformRole)) {
    return { status: "error", message: "This account does not have access to the admin console." };
  }

  await createSession(user.id);
  redirect(redirectTo);
}
