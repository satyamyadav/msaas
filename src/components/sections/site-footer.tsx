export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Modular SaaS Starter Kit</p>
        <p>
          Built to demonstrate feature flag driven modules, Prisma schema merging, and an ejectable architecture.
        </p>
      </div>
    </footer>
  );
}
