"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";

import {
  createThemeCss,
  shadcnThemeGroups,
  type ShadcnTheme,
  type ThemeMode,
  type ThemeTokens,
} from "@lib/shadcn-themes";

const MODE_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const COLOR_SWATCHES: { token: keyof ThemeTokens; label: string }[] = [
  { token: "background", label: "Background" },
  { token: "card", label: "Card" },
  { token: "primary", label: "Primary" },
  { token: "secondary", label: "Secondary" },
  { token: "accent", label: "Accent" },
];

export function ThemeGallery() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const value = query.trim().toLowerCase();

    return shadcnThemeGroups
      .map((group) => ({
        ...group,
        themes: group.themes.filter((theme) => {
          if (!value) {
            return true;
          }

          const haystack = `${theme.label} ${theme.id} ${theme.description ?? ""}`.toLowerCase();
          return haystack.includes(value);
        }),
      }))
      .filter((group) => group.themes.length > 0);
  }, [query]);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const hasResults = filteredGroups.some((group) => group.themes.length > 0);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Theme presets
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Browse shadcn/ui themes
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Explore ready-to-use palettes from <span className="font-medium text-foreground">ui.shadcn.com/themes</span> and see how they affect buttons, surfaces, and typography. Copy the CSS variables directly into your project without leaving the starter kit.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border/70 bg-muted/40 p-1 text-xs font-medium text-muted-foreground shadow-sm md:self-end">
          {MODE_OPTIONS.map((option) => {
            const isActive = option.id === mode;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={`rounded-full px-3 py-1.5 transition ${
                  isActive
                    ? "bg-background text-foreground shadow"
                    : "hover:bg-background/60 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground sm:max-w-xl">
          The tokens follow the conventions used across shadcn/ui components: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">--background</code>,
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">--foreground</code>, and friends. Swap them in <span className="font-medium text-foreground">src/app/globals.css</span> or scope them to custom containers.
        </p>
        <label className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="text-muted-foreground"
          >
            <path
              fill="currentColor"
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.414-1.414l-3.867-3.834Zm-5.242.656a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
            />
          </svg>
          <span className="sr-only">Search themes</span>
          <input
            type="search"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search palette"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </div>

      {hasResults ? (
        filteredGroups.map((group) => (
          <section key={group.id} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{group.title}</h2>
              <p className="text-sm text-muted-foreground sm:text-base">{group.description}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {group.themes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} mode={mode} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-12 text-center text-sm text-muted-foreground">
          No themes match <span className="font-mono text-foreground">“{query.trim()}”</span>. Try a different keyword or reset the search.
        </div>
      )}
    </section>
  );
}

function ThemeCard({ theme, mode }: { theme: ShadcnTheme; mode: ThemeMode }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  const tokens = theme.cssVars[mode];
  const previewStyle = useMemo(() => {
    return Object.entries(tokens).reduce((style, [token, value]) => {
      (style as Record<string, string>)[`--${token}`] = value;
      return style;
    }, {} as CSSProperties);
  }, [tokens]);

  const snippet = useMemo(() => createThemeCss(theme), [theme]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      resetTimer.current = setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Failed to copy theme CSS", error);
    }
  }, [snippet]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-card/60 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{theme.label}</h3>
          {theme.description ? <p className="text-sm text-muted-foreground">{theme.description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {theme.source ? (
            <a
              href={theme.source}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-ring hover:text-ring"
            >
              Open builder
            </a>
          ) : null}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              copied
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:border-ring hover:text-ring"
            }`}
          >
            {copied ? "Copied" : "Copy CSS"}
          </button>
        </div>
      </div>

      <div style={previewStyle} className="flex flex-1 flex-col gap-6 bg-background p-5 text-sm text-foreground">
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-base font-semibold">Component preview</p>
              <p className="text-xs text-muted-foreground">
                Buttons, borders, and supporting text inherit the currently selected palette.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow">
                Primary action
              </button>
              <button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                Secondary
              </button>
              <button className="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground">
                Danger
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Surface</p>
              <p className="mt-1 font-medium">bg-card</p>
              <p className="text-[11px] text-muted-foreground">text-card-foreground</p>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Popover</p>
              <p className="mt-1 font-medium">bg-popover</p>
              <p className="text-[11px] text-muted-foreground">text-popover-foreground</p>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Muted</p>
              <p className="mt-1 font-medium">bg-muted</p>
              <p className="text-[11px] text-muted-foreground">text-muted-foreground</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-5">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.token} className="space-y-2">
              <div
                className="h-12 w-full rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: `hsl(var(--${swatch.token}))` }}
              />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{swatch.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">--{swatch.token}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{tokens[swatch.token]}</p>
              </div>
            </div>
          ))}
        </div>

        <details className="rounded-xl border border-dashed border-border/70 bg-card/40 p-4 text-card-foreground">
          <summary className="cursor-pointer text-sm font-medium text-foreground">CSS variables</summary>
          <pre className="mt-3 overflow-x-auto rounded-md bg-muted/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            <code>{snippet}</code>
          </pre>
        </details>
      </div>
    </article>
  );
}
