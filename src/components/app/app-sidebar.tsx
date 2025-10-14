"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  Key,
  LayoutDashboard,
  LinkIcon,
  Settings2,
  Users,
} from "lucide-react";

import { MemberRole } from "@prisma/client";

import { cn } from "@lib/utils";

import { useActiveOrganization } from "./active-organization-context";

type NavItem = {
  label: string;
  href: (slug: string) => string;
  icon: ComponentType<{ className?: string }>;
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

const ROLE_ORDER: Record<MemberRole, number> = {
  [MemberRole.OWNER]: 3,
  [MemberRole.ADMIN]: 2,
  [MemberRole.MEMBER]: 1,
  [MemberRole.VIEWER]: 0,
};

const STORAGE_KEY = "urlcraft:sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const { organization, membership } = useActiveOrganization();

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // If localStorage is unavailable, default to expanded sidebar.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch {
      // Ignore persistence errors to avoid breaking navigation.
    }
  }, [isCollapsed]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((previous) => !previous);
  }, []);

  const accessibleNavItems = useMemo(() => {
    return NAV_ITEMS.map((group) => ({
      heading: group.heading,
      items: group.items.filter((item) => {
        const required = item.minRole ? ROLE_ORDER[item.minRole] : 0;
        const current = ROLE_ORDER[membership.role];
        return current >= required;
      }),
    })).filter((group) => group.items.length > 0);
  }, [membership.role]);

  return (
    <nav
      className={cn(
        "hidden flex-col border-r border-border/60 bg-background/40 p-4 transition-[width] duration-200 ease-in-out lg:flex",
        isCollapsed ? "w-20" : "w-64",
      )}
      aria-label="Workspace navigation"
      data-collapsed={isCollapsed}
    >
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-end")}>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!isCollapsed}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>
      <div className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {accessibleNavItems.map((group) => (
          <div key={group.heading}>
            <p
              className={cn(
                "mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground",
                isCollapsed ? "sr-only" : undefined,
              )}
            >
              {group.heading}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const href = item.href(organization.slug);
                const Icon = item.icon;
                const isActive = pathname === href || pathname?.startsWith(`${href}/`);
                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      aria-label={isCollapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        isCollapsed ? "justify-center px-0" : undefined,
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className={cn("whitespace-nowrap", isCollapsed ? "sr-only" : "inline")}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
