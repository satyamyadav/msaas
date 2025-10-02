"use server";

import { redirect } from "next/navigation";

import {
  authenticateUser,
  createSession,
  destroySession,
  getCurrentUser,
  registerUser,
} from "@modules/auth/lib/auth-service";

import { InviteStatus } from "@prisma/client";
import { prisma } from "@lib/db";
import { acceptInvite } from "@lib/server/invitations";
import { createOrganizationWithOwner } from "@lib/server/organizations";

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function resolveRedirect(target: string | undefined | null) {
  const fallback = "/app";
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

function validatePassword(password: string) {
  return password.length >= 8;
}

function validateEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  "use server";
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const redirectTo = resolveRedirect(getField(formData, "redirectTo"));
  const inviteToken = getField(formData, "inviteToken");

  if (!validateEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!password) {
    return { status: "error", message: "Password is required." };
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return { status: "error", message: "Invalid email or password." };
  }

  let destination = redirectTo;

  if (inviteToken) {
    try {
      const result = await acceptInvite(inviteToken, user.id, email);
      destination = `/app/${result.organizationSlug}`;
    } catch (error) {
      if (error instanceof Error) {
        return { status: "error", message: error.message };
      }
      return { status: "error", message: "Unable to accept invitation." };
    }
  }

  await createSession(user.id);
  redirect(destination);
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  "use server";
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const confirmPassword = getField(formData, "confirmPassword");
  const fullName = getField(formData, "fullName");
  const organizationName = getField(formData, "organizationName");
  const inviteToken = getField(formData, "inviteToken");
  const redirectTo = resolveRedirect(getField(formData, "redirectTo"));

  if (!validateEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!validatePassword(password)) {
    return { status: "error", message: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  if (!inviteToken && !organizationName) {
    return { status: "error", message: "Organization name is required." };
  }

  if (inviteToken) {
    const invite = await prisma.organizationInvite.findUnique({ where: { token: inviteToken } });
    if (!invite) {
      return { status: "error", message: "Invitation not found or has expired." };
    }

    if (invite.status !== InviteStatus.PENDING) {
      return { status: "error", message: "This invitation is no longer valid." };
    }

    if (invite.email.toLowerCase() !== email) {
      return { status: "error", message: "This invitation was issued for a different email address." };
    }
  }

  try {
    const user = await registerUser(email, password, fullName || null);
    let destination = redirectTo;

    if (inviteToken) {
      try {
        const result = await acceptInvite(inviteToken, user.id, email);
        destination = `/app/${result.organizationSlug}`;
      } catch (error) {
        await prisma.authUser.delete({ where: { id: user.id } }).catch(() => undefined);
        if (error instanceof Error) {
          return { status: "error", message: error.message };
        }
        return { status: "error", message: "Unable to accept invitation." };
      }
    } else if (organizationName) {
      try {
        const organization = await createOrganizationWithOwner({
          userId: user.id,
          name: organizationName,
        });
        destination = `/app/${organization.slug}`;
      } catch (error) {
        await prisma.authUser.delete({ where: { id: user.id } }).catch(() => undefined);
        console.error("Failed to create organization", error);
        return { status: "error", message: "Unexpected error creating your workspace." };
      }
    }

    await createSession(user.id);
    redirect(destination);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return { status: "error", message: "An account with that email already exists." };
    }

    console.error("Failed to register user", error);
    return { status: "error", message: "Unexpected error. Please try again." };
  }
}

export async function signOutAction() {
  "use server";
  await destroySession();
  redirect("/");
}

export { getCurrentUser };
