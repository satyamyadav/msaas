# Repository Guidelines

  ## Project Structure & Module Organization
  - `src/app` stores Next.js App Router routes; feature-aware pages compose shadcn components and Tailwind classes.
  - `src/components` layers reusable UI built from shadcn/ui primitives; avoid third-party UI kits outside shadcn.
  - `src/lib` provides shared utilities (feature flags, Prisma client, RBAC) consumed by both core app and modules.
  - `modules/<name>` houses ejectable packages (e.g., `auth`, `billing-stripe`) that may ship routes, shadcn-based layouts, and Prisma fragments.
  - `config/features.json` controls module toggles; keep it current when enabling or ejecting modules.
  - `prisma/schema.prisma` is the base schema; `npm run db:merge` builds `prisma/merged.prisma` for Prisma client generation.
  - `docs/` contains product and roadmap references (`PRD.md`, `PROJECT-OVERVIEW.md`, `TASKS.md`).

  ## Build, Test, and Development Commands
  - `npm run dev` launches the Next.js dev server on port 3000.
  - `npm run build` compiles the production bundle; run before Docker or deployments.
  - `npm run start` serves the compiled app (production or Docker usage).
  - `npm run lint` runs `next lint`; resolve findings before pushing.
  - `npm run db:merge` regenerates merged Prisma schemas after module or schema updates.
  - `npm install` auto-triggers Prisma merge + generate via `postinstall`.

  ## Coding Style & Naming Conventions
  - Use TypeScript with 2-space indentation; export functions with explicit return types.
  - Build UI strictly with shadcn/ui components (`@/components/ui/*`) and Tailwind utility classes; no other component libraries.
  - Component files live under `src/components/<Feature>/<Component>.tsx`; co-locate variant-specific Tailwind class maps when needed.
  - Name modules with the `@msaas/<module>` scope; directories remain kebab-case, React components PascalCase.
  - Enforce formatting via ESLint (`eslint-config-next`) and rely on Tailwind class ordering conventions.

  ## Testing Guidelines
  - Dedicated test suites are not yet wired; add unit or integration tests alongside new features.
  - Store tests next to code (`Component.test.tsx`, `Feature.spec.ts`) and add npm scripts when suites materialize.
  - Always run `npm run lint` before committing; treat lint success as a baseline quality check.

  ## Commit & Pull Request Guidelines
  - Follow `<type>: <imperative summary>` commit messages (`feat: add shadcn theme gallery`, `init: auth module`).
  - Rebase or squash to keep history clean; mention related issues or docs in the body.
  - Pull requests should capture: summary of changes, UI screenshots when shadcn/Tailwind updates affect visuals, schema impacts, docs updates, and confirmation that lint + Prisma merge ran.
  - Highlight module or schema changes so reviewers can rerun `npm run db:merge`.

  ## Environment & Configuration
  - Configure secrets in `.env`, especially `DATABASE_URL`, before running Prisma commands.
  - After editing feature flags or ejecting modules, rerun `npm run db:merge` and commit resulting Prisma artifacts.
  - Tailwind theme tweaks live in `tailwind.config.ts`; prefer extending shadcn tokens rather than overriding ad hoc styles.