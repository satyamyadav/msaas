import { redirect } from "next/navigation";

import { getOrganizationsForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export default async function AppHomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent("/app")}`);
  }

  const organizations = await getOrganizationsForUser(user.id);
  if (!organizations.length) {
    redirect("/app/new");
  }

  redirect(`/app/${organizations[0].organization.slug}`);
}
