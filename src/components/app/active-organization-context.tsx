"use client";

import { createContext, useContext } from "react";

import type { MemberRole, PlanTier } from "@prisma/client";

type ActiveOrganizationContextValue = {
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

const ActiveOrganizationContext = createContext<ActiveOrganizationContextValue | null>(null);

export function ActiveOrganizationProvider({
  value,
  children,
}: {
  value: ActiveOrganizationContextValue;
  children: React.ReactNode;
}) {
  return <ActiveOrganizationContext.Provider value={value}>{children}</ActiveOrganizationContext.Provider>;
}

export function useActiveOrganization() {
  const context = useContext(ActiveOrganizationContext);
  if (!context) {
    throw new Error("ActiveOrganizationContext is not available.");
  }
  return context;
}
