import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ejecting modules",
  description: "Understand how to customize bundled modules without losing upgrade paths.",
};

const steps = [
  {
    title: "Run the eject script",
    description:
      "Each module exposes an npm script that copies its routes, components, and Prisma fragments into your application codebase.",
  },
  {
    title: "Regenerate Prisma",
    description:
      "After ejecting, run npm run db:merge so the module's schema fragments are composed into prisma/merged.prisma.",
  },
  {
    title: "Take ownership",
    description:
      "Once a module is ejected it is yours to edit. Future updates will no longer apply automatically, so consider documenting changes.",
  },
];

export default function EjectionDocPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Documentation</p>
        <h1 className="text-3xl font-semibold">Ejecting modules</h1>
        <p className="text-muted-foreground">
          Modules ship ready-to-run experiences. When you need deeper customization, follow this process to eject the code safely.
        </p>
      </header>
      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Step {index + 1}</span>
              <h2 className="text-2xl font-semibold">{step.title}</h2>
            </div>
            <p className="text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      <p className="rounded-md border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        Pro tip: commit your repo before ejecting so you can diff the generated files and document every customization.
      </p>
    </div>
  );
}
