import { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminUser } from "@/lib/server/admin-auth";
import { PlatformRole } from "@prisma/client";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b bg-card/40 px-4 py-3 text-sm text-muted-foreground md:hidden">
        Signed in as <span className="font-medium text-foreground">{user.email}</span>
      </div>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-card/40 p-6 md:block">
          <div className="mb-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {user.platformRole === PlatformRole.SUPER_ADMIN ? "Super admin" : "Platform admin"}
            </p>
            <h1 className="text-xl font-semibold">Control center</h1>
          </div>
          <AdminNav />
        </aside>
        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 md:px-10 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
