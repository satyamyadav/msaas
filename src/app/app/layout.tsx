import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@modules/auth/actions";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent("/app")}`);
  }

  return <>{children}</>;
}
