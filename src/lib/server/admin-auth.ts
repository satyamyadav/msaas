import { redirect } from "next/navigation";

import { getCurrentUser } from "@modules/auth/actions";
import { PlatformRole } from "@prisma/client";

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent("/admin")}`);
  }

  if (user.platformRole !== PlatformRole.ADMIN) {
    redirect("/app");
  }

  return user;
}
