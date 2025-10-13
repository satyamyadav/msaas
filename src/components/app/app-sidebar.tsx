"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, Globe, Key, LayoutDashboard, LinkIcon, Settings2, Users } from "lucide-react";

import { MemberRole } from "@prisma/client";

import { cn } from "@lib/utils";

import { useActiveOrganization } from "./active-organization-context";

type NavItem = {
  label: string;
  href: (slug: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  minRole?: MemberRole;
};

const NAV_ITEMS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Workspace",
    items: [
      { label: "Links", href: (slug) => `/app/${slug}`, icon: LinkIcon },
      { label: "Overview", href: (slug) => `/app/${slug}/links`, icon: LayoutDashboard },
      { label: "Analytics", href: (slug) => `/app/${slug}/analytics`, icon: BarChart3 },
    ],
  },
  {
    heading: "Administration",
    items: [
      { label: "Members", href: (slug) => `/app/${slug}/settings/members`, icon: Users, minRole: MemberRole.ADMIN },
      { label: "Domains", href: (slug) => `/app/${slug}/settings/domains`, icon: Globe, minRole: MemberRole.ADMIN },
      { label: "API Keys", href: (slug) => `/app/${slug}/settings/api-keys`, icon: Key, minRole: MemberRole.ADMIN },
      { label: "Billing", href: (slug) => `/app/${slug}/settings/billing`, icon: CreditCard, minRole: MemberRole.ADMIN },
      { label: "Settings", href: (slug) => `/app/${slug}/settings`, icon: Settings2, minRole: MemberRole.ADMIN },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { organization } = useActiveOrganization() as { organization: { slug: string; membership: { role: MemberRole } } };

  return (
    <nav className="hidden w-64 flex-col border-r border-border/60 bg-background/40 p-6 lg:flex">
      {NAV_ITEMS.map((group) => (
        <div key={group.heading} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {group.heading}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const href = item.href(organization.slug);
              const Icon = item.icon;
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              const roleOrder: Record<MemberRole, number> = {
                [MemberRole.OWNER]: 3,
                [MemberRole.ADMIN]: 2,
                [MemberRole.MEMBER]: 1,
                [MemberRole.VIEWER]: 0,
              };
              const required = item.minRole ? roleOrder[item.minRole] : 0;
              const current = roleOrder[organization?.membership?.role];
              if (current < required) {
                return null;
              }
              return (
                <li key={item.label}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
