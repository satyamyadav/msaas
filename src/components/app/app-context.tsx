"use client";

import { createContext, useContext } from "react";

import type { MemberRole, PlanTier } from "@prisma/client";

type OrganizationSummary = {
  organization: {
    id: string;
    name: string;
    slug: string;
    planTier: PlanTier;
    logoUrl: string | null;
  };
  membership: {
    id: string;
    role: MemberRole;
  };
};

type AppUser = {
  id: string;
  email: string;
  displayName: string | null;
};

type AppContextValue = {
  user: AppUser;
  organizations: OrganizationSummary[];
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ value, children }: { value: AppContextValue; children: React.ReactNode }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext is not available.");
  }
  return context;
}
