import { notFound, redirect } from "next/navigation";

import { getModuleCopy, isFeatureEnabled } from "@lib/feature-flags";
import { getCurrentUser } from "@modules/auth/actions";
import { PlatformRole } from "@prisma/client";

import { AdminSignInForm } from "./sign-in-form";

type SearchParams = Record<string, string | string[] | undefined>;

type AdminSignInPageProps = {
  searchParams?: Promise<SearchParams>;
};

export const metadata = {
  title: "Platform admin sign in",
};

async function resolveSearchParams(searchParams?: Promise<SearchParams>) {
  if (!searchParams) {
    return undefined;
  }

  return await searchParams;
}

function resolveRedirect(searchParams: SearchParams | undefined) {
  const value = typeof searchParams?.redirectTo === "string" ? searchParams.redirectTo : undefined;
  if (!value) {
    return "/admin";
  }
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }
  return value;
}

export default async function AdminSignInPage({ searchParams }: AdminSignInPageProps) {
  if (!isFeatureEnabled("auth")) {
    notFound();
  }

  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const redirectTo = resolveRedirect(resolvedSearchParams);
  const sessionUser = await getCurrentUser();

  if (sessionUser) {
    if ([PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN].includes(sessionUser.platformRole)) {
      redirect(redirectTo);
    }

    redirect("/app");
  }

  const moduleMeta = getModuleCopy("auth");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl flex-col items-center justify-center gap-10 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Platform control</p>
        <h1 className="text-4xl font-bold">Sign in as an owner</h1>
        <p className="max-w-2xl text-balance text-base text-muted-foreground">
          {moduleMeta.description} Administrators with elevated access can manage organizations, users, and billing without
          affecting end-customer logins.
        </p>
      </div>
      <AdminSignInForm redirectTo={redirectTo} />
    </main>
  );
}
