# Product Requirements Document: Modular, Ejectable Monolithic SaaS Starter Kit

## 1. Summary
A production-ready Next.js SaaS starter kit that ships as a monolithic application with modular boundaries. Core functionality lives in a single Next.js 14 (App Router) codebase, while feature modules (auth, billing, admin, etc.) are delivered as npm packages under the `@saas/*` scope. Teams can enable, disable, or swap modules through configuration and eject any module into the local repo to customize it without forking the entire starter kit.

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
- **Module Loader**: Discovers installed `@saas/*` packages, merges their routes, Prisma schemas, and UI assets.
- **Feature Flag Management**: JSON-based configuration with runtime loader utilities.
- **Ejectable Modules Workflow**: CLI or manual copy to `modules/` directory with automatic precedence.
- **PostgreSQL Integration**: Dockerized local database with Prisma migrations.
- **Deployment Assets**: Dockerfile and Docker Compose for local and small-scale cloud deployments.

### Out of Scope (v1)
- Native mobile clients.
- Built-in analytics dashboards beyond template placeholders.
- Automated billing proration or tax localization.

## 7. Core Modules
These modules ship with the starter kit and define the default folder layout when ejected locally. Each module resides under `node_modules/@saas/<name>` by default and can be overridden by dropping code into `modules/<name>/`.

### Auth (`auth`)
- **Scope**: End-to-end authentication, session management, onboarding, and password reset flows for every user in the system.
- **Package**: `@saas/auth` (ships with providers, email templates, and server actions).
- **Placement**: Top-level because it affects the entire app; routes live in `app/(auth)/...` to isolate auth layouts from the dashboard shell.

```
modules/auth/
└── app/(auth)/
    ├── login/page.tsx
    ├── register/page.tsx
    └── api/auth/[...nextauth]/route.ts
```

### Admin (`admin`)
- **Scope**: Administrative tooling, global dashboards, and feature toggles for staff roles.
- **Package**: `@saas/admin`.
- **Placement**: Surfaces under `app/admin` with nested sections like `admin/dashboard` for clarity and deep-linking.

```
modules/admin/
└── app/admin/
    ├── layout.tsx
    ├── page.tsx                  # admin landing
    └── dashboard/page.tsx        # default dashboard module
```

### Payment (`payment`)
- **Scope**: Subscription management, invoicing, and provider integrations (Stripe by default).
- **Package**: `@saas/billing-stripe` (swappable for other providers).
- **Placement**: Shared between end-user settings and admin oversight; nests under admin for financial visibility.

```
modules/payment/
└── app/
    ├── (dashboard)/billing/page.tsx   # customer-facing billing portal
    └── admin/billing/page.tsx         # admin-level revenue view
```

### Organization (`org`)
- **Scope**: Multi-tenant workspaces, membership management, and role assignment within organizations.
- **Package**: `@saas/org`.
- **Placement**: Provides shared hooks/context for tenant resolution and exposes management screens under admin.

```
modules/org/
└── app/
    ├── (dashboard)/organizations/page.tsx
    └── admin/organizations/[orgId]/page.tsx
```

Inter-module relationships:
- `auth` seeds the user session and exposes context consumed by `admin`, `payment`, and `org`.
- `admin` imports dashboards from other modules (billing, organizations) via slot-based components so nested screens can be disabled with feature flags.
- `payment` and `org` register their navigation entries through the admin module and expose hooks that other modules can consume (`useBillingPortal`, `useActiveOrg`).


## 8. Functional Requirements
1. **Module Lifecycle**
   - Detect installed modules via `package.json` dependencies (prefix `@saas/`).
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
- **Framework**: Next.js 14 with App Router, server actions enabled.
- **UI Layer**: Tailwind CSS, shadcn/ui component library, fully tree-shaken in build.
- **Backend**: API routes and server actions bundled with Next.js, Prisma ORM for DB access.
- **Modules**: Published npm packages (`@saas/auth`, `@saas/billing-stripe`, etc.) exporting Next.js routes, components, Prisma schema fragments, and configuration hooks.
- **Configuration**: `.env` for secrets, `config/features.json` for feature toggles, `next.config.js` for webpack aliases.

## 11. Project Structure (Reference)
```
saas-app/
├── app/                        # core app routes and layouts
├── modules/                    # ejected modules (empty by default)
│   ├── auth/                   # override for @saas/auth
│   └── billing-stripe/         # override for @saas/billing-stripe
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
Example: `@saas/auth`
```
@saas/auth/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   └── api/auth/login/route.ts
├── prisma/
│   └── auth.prisma
└── package.json
```
- Modules expose a `module.json` manifest (v1 deliverable) describing routes, schema files, and optional setup scripts.
- Installation via `npm install @saas/auth` registers the module automatically.
- Route directories follow App Router conventions so they are treeshaked when disabled by feature flags.

## 13. Feature Management
`config/features.json`
```
{
  "auth": true,
  "billing": "stripe",
  "admin": false
}
```
Loader (`lib/feature-flags.ts`):
```ts
import features from "../config/features.json";

export function isFeatureEnabled(key: string): boolean {
  return Boolean((features as Record<string, unknown>)[key]);
}

export function getBillingProvider(): string | null {
  return typeof features.billing === "string" ? features.billing : null;
}
```
- Billing providers map to module names (e.g., `stripe` -> `@saas/billing-stripe`).
- Document guidance for staging vs production flag files and environment variable overrides.

## 14. Ejectable Modules Workflow
- Webpack alias in `next.config.js` ensures `modules/*` resolves before `node_modules/@saas/*`:
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
cp -r node_modules/@saas/auth/* modules/auth/
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
Example module schema (`@saas/auth/prisma/auth.prisma`):
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
find node_modules/@saas -name "*.prisma" >> prisma/_modules.prisma
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
1. Install dependencies: `npm install @saas/auth @saas/billing-stripe`.
2. Enable features by editing `config/features.json`:
```
{
  "auth": true,
  "billing": "stripe"
}
```
3. Start infrastructure: `docker-compose up -d db`.
4. Run migrations: `npx prisma migrate dev`.
5. Start dev server: `npm run dev`.
6. Eject module (if needed): `cp -r node_modules/@saas/auth modules/auth` (or future CLI).

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
