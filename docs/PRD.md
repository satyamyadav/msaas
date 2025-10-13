# Product Requirements Document: Modular, Ejectable Monolithic SaaS Starter Kit

## 1. Summary
A production-ready Next.js SaaS starter kit that ships as a monolithic application with modular boundaries. Core functionality
lives in a single Next.js 15 (App Router) codebase, while feature modules (auth, billing, etc.) are delivered as npm packages
under the `@msaas/*` scope or ejected into `/modules`. Teams can enable, disable, or swap modules through configuration and
eject any module into the local repo to customize it without forking the entire starter kit.

### Status Snapshot (April 2025)
- ✅ Marketing surfaces, workspace experience, analytics, admin console, and feature-flagged modules are implemented in the repo.
- ✅ Authentication module provides session cookies, invite acceptance, and workspace bootstrapping; Stripe billing module renders credential forms and enforces plan limits via Prisma data.
- ⚠️ Stripe API/webhook wiring, edge redirect service, and REST API endpoints remain in progress.
- 🟡 CLI automation for module management and advanced security features are scoped for upcoming milestones.

## 2. Goals
- Deliver a SaaS starter kit that can launch a production MVP in under one week.
- Promote maintainability through modular feature boundaries and an opinionated file structure.
- Allow teams to customize modules without losing the ability to receive upstream updates.
- Support a frictionless local development experience with Docker-backed Postgres and `npm` workflows.
- Provide a clear path to deploy in containerized environments with minimal additional setup.

### Non-Goals
- Support for non-Next.js front-ends or alternative frameworks.
- First-class multi-tenant sharding or cross-region replication in v1.
- Managed cloud infrastructure templates (Kubernetes, Terraform) beyond Docker Compose guidance.

## 3. Success Metrics
- Developers can create a new SaaS project and complete initial setup (clone, install, run) in <15 minutes.
- Enabling or disabling a feature module requires no more than a config change and restart.
- Ejecting a module and customizing it locally takes <10 minutes using supplied tooling.
- CI pipeline (build + lint + test) completes in <8 minutes on a standard runner.

## 4. Target Users & Personas
- **Indie SaaS Developer**: Solo builder validating an idea who wants best-practice defaults without deep infra knowledge.
- **Startup Platform Team**: Small team standardizing on a shared monolith but expecting module-level ownership.
- **Agencies / Consultancies**: Need rapid MVP delivery with the option to extend and hand off to clients.

## 5. Primary Use Cases
- Launch a greenfield SaaS product with authentication, billing, and admin dashboards out of the box.
- Swap the billing provider module (Stripe to Razorpay, etc.) without rewriting core logic.
- Eject and customize modules (e.g., upgrade the auth UI) while still consuming other modules from npm.
- Gate early-access features behind feature flags to segment beta users.

## 6. In-Scope Features
- **Core App Shell**: Landing page, authenticated dashboard, settings, and shared layout components.
- **Module Loader**: Discovers installed `@msaas/*` packages and local overrides, merges their routes, Prisma schemas, and UI assets.
- **Feature Flag Management**: JSON-based configuration with runtime loader utilities.
- **Ejectable Modules Workflow**: CLI or manual copy to `modules/` directory with automatic precedence.
- **PostgreSQL Integration**: Dockerized local database with Prisma migrations.
- **Deployment Assets**: Dockerfile and Docker Compose for local and small-scale cloud deployments.

### Out of Scope (v1)
- Native mobile clients.
- Built-in analytics dashboards beyond template placeholders.
- Automated billing proration or tax localization.

## 7. Modules & Core Surfaces
These modules ship with the starter kit today and define the default folder layout when ejected locally. Additional workspace
and admin experiences live in the core app shell (`src/app`) but lean on the same feature flag and override patterns.

### Auth (`auth`)
- **Scope**: Email/password authentication, session cookies, invite acceptance, organization bootstrapping, and sign-out flows.
- **Package**: `@msaas/auth` (mirrored in `modules/auth` when ejected).
- **Placement**: Routes live under `app/(auth)/sign-in` and get re-exported to `/sign-in`; server actions reside in `@modules/auth/actions`.

```
modules/auth/
├── actions.ts
├── state.ts
└── app/(auth)/sign-in/
    ├── page.tsx
    └── sign-in-form.tsx
```

### Stripe Billing (`billing-stripe`)
- **Scope**: Customer-facing billing dashboard, credential storage UI, plan limit messaging, and webhook documentation.
- **Package**: `@msaas/billing-stripe`.
- **Placement**: Exposed via `/billing` for marketing/demo, and consumed inside workspace billing settings for plan overviews.

```
modules/billing-stripe/
└── app/(dashboard)/billing/page.tsx
```

### Core Workspace & Admin (in-repo)
- **Scope**: Multi-tenant workspace dashboards, analytics, link lifecycle, invitations, custom domains, API keys, and the platform admin console.
- **Placement**: Implemented in `src/app/app/*` and `src/app/admin/*` with shared server utilities under `src/lib/server`.
- **Feature Flags**: Controlled through `config/features.json`; admin settings write to `config/pricing.json` and `config/integrations.json` so module toggles stay declarative.

Inter-module relationships:
- `auth` seeds the user session and exposes helpers consumed by workspace, admin, and billing flows.
- `billing-stripe` contributes plan metadata that workspace settings and admin analytics consume.
- Core workspace services (analytics, domains, API keys) emit audit logs that feed the admin log viewer.


## 8. Functional Requirements
1. **Module Lifecycle**
   - Detect installed modules via `package.json` dependencies (prefix `@msaas/`).
   - Merge module routes into the Next.js App Router automatically.
   - Combine Prisma schemas from core and modules into `prisma/merged.prisma` before generate.
   - Respect feature flags to include/exclude routes, UI elements, and backend logic.

2. **Feature Flags**
   - Store flags in `config/features.json` (JSON only in v1).
   - Provide helpers (`isFeatureEnabled`, `getBillingProvider`) for both server and client contexts.
   - Changes to feature flags should apply on next server restart (hot reload acceptable in dev).

3. **Ejection Workflow**
   - If a directory exists in `modules/<moduleName>/`, it overrides the npm version.
   - Supply a CLI (`saas eject <module>`, v0.1) or documented manual steps.
   - Maintain compatibility between ejected modules and upstream updates via documented merge strategy.

4. **Database Operations**
   - Local environment uses Dockerized Postgres 15 with persistent volume.
   - `npx prisma migrate dev` runs after module schema merge without manual edits.
   - Provide sample seed script for baseline admin user.

5. **Dev Experience**
   - `npm run dev` boots Next.js with module auto-loading.
   - `npm run lint`, `npm run test`, and `npm run build` must succeed out of the box.
   - Provide `README` quickstart and troubleshooting section.

## 9. Non-Functional Requirements
- **Performance**: Starter kit should serve first byte of dashboard within 1s on local hardware.
- **Security**: Follow OWASP top 10 best practices for auth module; enforce HTTPS in production configuration templates.
- **Reliability**: Docker Compose environment should survive restarts without data loss (named volume for Postgres).
- **Extensibility**: Public module API surface documented to encourage third-party module development.

## 10. Architecture Overview
- **Framework**: Next.js 15 with App Router, server actions enabled.
- **UI Layer**: Tailwind CSS, shadcn/ui component library, fully tree-shaken in build.
- **Backend**: API routes and server actions bundled with Next.js, Prisma ORM for DB access.
- **Modules**: Published npm packages (`@msaas/auth`, `@msaas/billing-stripe`, etc.) and local overrides exporting Next.js routes, components, Prisma schema fragments, and configuration hooks.
- **Configuration**: `.env` for secrets, `config/features.json` for feature toggles, `next.config.js` for webpack aliases.

## 11. Project Structure (Reference)
```
msaas/
├── app/                        # core app routes and layouts
├── modules/                    # ejected modules (empty by default)
│   ├── auth/                   # override for @msaas/auth
│   └── billing-stripe/         # override for @msaas/billing-stripe
├── config/
│   └── features.json           # feature flag definitions
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── feature-flags.ts        # flag helpers
│   └── rbac.ts                 # shared authorization logic
├── prisma/
│   ├── schema.prisma           # core schema
│   └── _modules.prisma         # generated merged schemas
├── docker-compose.yml
├── Dockerfile
└── next.config.js
```

## 12. Module Packaging Guidelines
Example: `@msaas/auth`
```
@msaas/auth/
├── actions.ts
├── state.ts
├── lib/
│   └── auth-service.ts
├── prisma/
│   └── auth.prisma
└── app/
    └── (auth)/sign-in/
        ├── page.tsx
        └── sign-in-form.tsx
```
- Modules expose a `module.json` manifest (v1 deliverable) describing routes, schema files, and optional setup scripts.
- Installation via `npm install @msaas/auth` registers the module automatically.
- Route directories follow App Router conventions so they are treeshaked when disabled by feature flags.

## 13. Feature Management
`config/features.json`
```
{
  "modules": {
    "auth": {
      "enabled": true,
      "displayName": "Authentication",
      "description": "Custom session auth module with invites and workspace bootstrapping."
    },
    "billing-stripe": {
      "enabled": true,
      "displayName": "Stripe Billing",
      "description": "Stripe-powered billing settings, subscription management, and webhook scaffolding."
    }
  },
  "billing": {
    "provider": "stripe"
  }
}
```
Loader (`lib/feature-flags.ts`):
```ts
import features from "@config/features.json";

const FEATURE_CONFIG = features;

export type ModuleKey = keyof typeof FEATURE_CONFIG.modules;

export function isFeatureEnabled(module: ModuleKey): boolean {
  return Boolean(FEATURE_CONFIG.modules[module]?.enabled);
}

export function getModuleCopy(module: ModuleKey) {
  const data = FEATURE_CONFIG.modules[module];
  if (!data) {
    throw new Error(`Unknown module: ${module}`);
  }
  return data;
}

export function getBillingProvider(): string {
  return FEATURE_CONFIG.billing.provider;
}
```
- Billing providers map to module names (e.g., `stripe` -> `@msaas/billing-stripe`).
- Document guidance for staging vs production flag files and environment variable overrides.

## 14. Ejectable Modules Workflow
- Webpack alias in `next.config.js` ensures `modules/*` resolves before `node_modules/@msaas/*`:
```js
const path = require("path");

module.exports = {
  experimental: { appDir: true },
  webpack: (config) => {
    config.resolve.modules.unshift(path.resolve("./modules"));
    return config;
  },
};
```
- Manual eject steps:
```
mkdir -p modules/auth
cp -r node_modules/@msaas/auth/* modules/auth/
```
- CLI roadmap: `saas eject <module>` copies files, registers merge conflicts, and writes upgrade notes.
- Document merge strategy for keeping local overrides in sync with upstream releases.

## 15. Data Model & Migrations
Base schema (`prisma/schema.prisma`):
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```
Example module schema (`@msaas/auth/prisma/auth.prisma`):
```
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  role      String   @default("member")
}
```
Merge pipeline:
```
find modules -name "*.prisma" > prisma/_modules.prisma
find node_modules/@msaas -name "*.prisma" >> prisma/_modules.prisma
cat prisma/schema.prisma prisma/_modules.prisma > prisma/merged.prisma
npx prisma generate --schema prisma/merged.prisma
```
- Provide script (`npm run prisma:generate`) encapsulating merge + generate.
- Ensure migrations directory includes module-specific migrations namespaced by module.

## 16. Deployment & Ops
- **Dockerfile** baseline:
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
- **docker-compose.yml** runs web + Postgres with named volume:
```
version: "3.8"
services:
  web:
    build: .
    container_name: saas-web
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/saasdb
    depends_on:
      - db

  db:
    image: postgres:15
    container_name: saas-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: saasdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```
- Document deployment steps for Railway/Fly.io/Render as initial targets.
- Provide guidance for scaling (separating modules into microservices is a future enhancement).

## 17. Development Workflow
1. Install dependencies: `npm install @msaas/auth @msaas/billing-stripe`.
2. Enable features by editing `config/features.json`:
```
{
  "modules": {
    "auth": { "enabled": true, "displayName": "Authentication", "description": "Custom session auth module." },
    "billing-stripe": { "enabled": true, "displayName": "Stripe Billing", "description": "Stripe-powered billing surface." }
  },
  "billing": { "provider": "stripe" }
}
```
3. Start infrastructure: `docker-compose up -d db`.
4. Run migrations: `npx prisma migrate dev`.
5. Start dev server: `npm run dev`.
6. Eject module (if needed): `cp -r node_modules/@msaas/auth modules/auth` (or future CLI).

## 18. Timeline & Milestones
- **M1 – Core Scaffold (Week 2)**: Next.js app, Docker Compose, base Prisma schema, feature flag loader.
- **M2 – Module SDK (Week 4)**: Module discovery, schema merge pipeline, auth + billing modules published.
- **M3 – Ejection Tooling (Week 6)**: CLI for ejecting modules, documentation for upgrade path.
- **M4 – Production Hardening (Week 8)**: Add tests, CI setup, security review, deployment guides.

## 19. Risks & Open Questions
- How do we manage version compatibility between core app and individual modules? (Need semantic version policy.)
- Should feature flags support environment overrides (e.g., via `process.env`) in v1?
- What is the strategy for distributing private modules to paying customers (npm private registry vs. GitHub Packages)?
- Need clarity on licensing and contribution model for third-party module authors.
