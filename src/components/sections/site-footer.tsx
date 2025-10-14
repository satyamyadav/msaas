export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} UrlCraft</p>
        <p>
          The collaborative link management platform for creating, branding, and tracking every campaign URL.
        </p>
      </div>
    </footer>
  );
}
