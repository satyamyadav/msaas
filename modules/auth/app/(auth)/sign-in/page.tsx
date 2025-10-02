import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@components/ui/badge";
import { getModuleCopy, isFeatureEnabled } from "@lib/feature-flags";
import { getCurrentUser } from "@modules/auth/actions";

import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Sign in",
};

type SearchParams = Record<string, string | string[] | undefined>;

type AuthSignInPageProps = {
  searchParams?: Promise<SearchParams>;
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
    return "/billing";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/billing";
  }

  return value;
}

function resolveMode(searchParams: SearchParams | undefined) {
  const value = typeof searchParams?.mode === "string" ? searchParams.mode : undefined;
  return value === "register" ? "register" : "login";
}

export default async function AuthSignInPage({ searchParams }: AuthSignInPageProps) {
  if (!isFeatureEnabled("auth")) {
    notFound();
  }

  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const redirectTo = resolveRedirect(resolvedSearchParams);
  const mode = resolveMode(resolvedSearchParams);
  const sessionUser = await getCurrentUser();

  if (sessionUser) {
    redirect(redirectTo);
  }

  const moduleMeta = getModuleCopy("auth");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col items-center justify-center gap-10 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge>{moduleMeta.displayName}</Badge>
        <h1 className="text-4xl font-bold">Secure sign-in experience</h1>
        <p className="max-w-2xl text-balance text-base text-muted-foreground">
          {moduleMeta.description}
        </p>
      </div>
      <SignInForm mode={mode} redirectTo={redirectTo} />
      <p className="text-center text-xs text-muted-foreground">
        First time here? <Link href="/docs/getting-started" className="underline">Read the quickstart guide</Link>.
      </p>
    </main>
  );
}
