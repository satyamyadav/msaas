import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace best practices",
  description: "Decide how to organize teams and environments across workspaces.",
};

const recommendations = [
  {
    title: "Start with one workspace per team",
    description:
      "Workspaces isolate analytics, link history, and billing details. Creating one per functional team keeps reporting focused.",
  },
  {
    title: "Use environments for staging",
    description:
      "Need a sandbox? Spin up a second workspace for staging and invite only the folks who should see in-progress experiments.",
  },
  {
    title: "Delegate billing ownership",
    description:
      "Assign the Billing role to finance admins so they can update payment methods without receiving full admin permissions.",
  },
];

export default function WorkspacesDocPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Documentation</p>
        <h1 className="text-3xl font-semibold">Workspace best practices</h1>
        <p className="text-muted-foreground">
          Workspaces keep data siloed while letting you manage access centrally. Here are common patterns that scale well from day one.
        </p>
      </header>
      <div className="space-y-6">
        {recommendations.map((item) => (
          <section key={item.title} className="space-y-2">
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <p className="text-muted-foreground">{item.description}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
