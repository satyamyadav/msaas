"use server";

import { redirect } from "next/navigation";

import {
  authenticateUser,
  createSession,
  destroySession,
  getCurrentUser,
  registerUser,
} from "@modules/auth/lib/auth-service";

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
  const fallback = "/billing";
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

  await createSession(user.id);
  redirect(redirectTo);
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  "use server";
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const confirmPassword = getField(formData, "confirmPassword");
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

  try {
    const user = await registerUser(email, password);
    await createSession(user.id);
    redirect(redirectTo);
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
