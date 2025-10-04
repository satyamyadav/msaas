# Modular SaaS Starter Kit

A Next.js 14 starter template that demonstrates how to wire feature flags, ejectable modules, and Prisma schema merging for a modular monolithic SaaS platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS with a themeable design system
- **Database**: Prisma ORM targeting PostgreSQL
- **Feature flags**: JSON-driven configuration exposed through typed helpers
- **Modules**: Example `@msaas/auth` and `@msaas/billing-stripe` packages rendered through feature-aware routes

## Getting Started

1. Install dependencies and generate the Prisma client:
   ```bash
   npm install
   ```
2. Provide a `DATABASE_URL` in `.env` if you intend to run migrations.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit [http://localhost:3000](http://localhost:3000) to explore the starter experience.

### Bootstrapping a platform super admin

1. Provide environment variables in `.env` (or your shell) before seeding:
   - `PLATFORM_SUPERADMIN_EMAIL`
   - `PLATFORM_SUPERADMIN_PASSWORD`
   - Optional: `PLATFORM_SUPERADMIN_NAME`, `PLATFORM_SUPERADMIN_FORCE_RESET=true`
2. Run the seed script once your database is migrated:
   ```bash
   npm run bootstrap:super-admin
   # or
   npx prisma db seed
   ```
3. Sign in to the owner console at [http://localhost:3000/sign-in?mode=login&redirectTo=%2Fadmin](http://localhost:3000/sign-in?mode=login&redirectTo=%2Fadmin) using the credentials above. Use this super admin account to create additional platform admins without impacting workspace users.

## Project Structure

```
├── config/                # Feature flag definitions
├── modules/               # Ejectable module stubs (auth, billing)
├── prisma/                # Base schema plus generated merges
├── scripts/               # Prisma merge automation
├── src/app/               # Next.js routes
├── src/components/        # UI building blocks
└── src/lib/               # Shared utilities (feature flags, RBAC, Prisma client)
```

### Feature Flags

`config/features.json` powers helpers in `src/lib/feature-flags.ts`:

```ts
import { getEnabledModules, isFeatureEnabled } from "@lib/feature-flags";
```

Toggle entries to hide routes or switch billing providers without touching UI code.

### Prisma Schema Merging

Run the merge script whenever module schemas change:

```bash
npm run db:merge
```

The script stitches the base `prisma/schema.prisma` together with module fragments into `prisma/merged.prisma`. This file feeds `prisma generate` to keep the client in sync.

### Module Ejection Workflow

- Modules live under `/modules/<name>` with their own UI pages and Prisma fragments.
- Routes in `src/app` dynamically import module pages so they can be swapped or removed.
- Update `config/features.json` to disable a module without deleting code, or move it under `modules/` to edit locally.

## Next Steps

- Implement real authentication via NextAuth.js inside `modules/auth`.
- Connect Stripe APIs and webhook handlers under `modules/billing-stripe`.
- Extend the CLI tooling described in `docs/TASKS.md` to automate ejection flows.

Refer to [`docs/TASKS.md`](docs/TASKS.md) for the full engineering roadmap.
