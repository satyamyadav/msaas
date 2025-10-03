import { redirect } from "next/navigation";

import { getCurrentUser } from "@modules/auth/actions";
import { PlatformRole } from "@prisma/client";

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/sign-in?redirectTo=${encodeURIComponent("/admin")}`);
  }

  if (![PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN].includes(user.platformRole)) {
    redirect("/app");
  }

  return user;
}

export async function requireSuperAdminUser() {
  const user = await requireAdminUser();
  if (user.platformRole !== PlatformRole.SUPER_ADMIN) {
    redirect("/admin");
  }
  return user;
}
