# Task Breakdown for Modular, Ejectable Monolithic SaaS Starter Kit

This plan converts the TRD into actionable engineering tasks. Tasks are grouped by milestone (v1, v2, v3) and, where appropriate, by component. The npm scope for modules is **@msaas/**.

## Milestone v1 – Template Foundation

### Project Initialization
- [ ] Scaffold Next.js 14 (App Router, TypeScript) project with TailwindCSS and shadcn/ui.
- [ ] Configure base project structure (`app/`, `modules/`, `config/`, `lib/`, `prisma/`).
- [ ] Add eslint/prettier and Husky (or alternative) for linting + formatting.

### Configuration & Utilities
- [ ] Implement `config/features.json` with default flags.
- [ ] Build `lib/feature-flags.ts` to expose `isFeatureEnabled` and `getBillingProvider` helpers.
- [ ] Create `lib/db.ts` Prisma client wrapper and `lib/rbac.ts` scaffold with placeholder roles.

### Database & Prisma
- [ ] Author `prisma/schema.prisma` base schema and environment variables (`DATABASE_URL`).
- [ ] Implement schema merging workflow:
  - [ ] Script to collect `*.prisma` files from `modules/` overrides and `node_modules/@msaas/*` packages.
  - [ ] Concatenate into `prisma/_modules.prisma` and generate `prisma/merged.prisma`.
  - [ ] Wire script into npm scripts (prebuild / postinstall as needed).
- [ ] Run initial migration and document workflow.

### Module System (@msaas/*)
- [ ] Publish or stub example packages: `@msaas/auth`, `@msaas/billing-stripe`.
- [ ] Ensure modules expose Next.js routes (`app/`), API handlers, and Prisma fragments.
- [ ] Create loader that auto-registers module routes based on feature flags.
- [ ] Document installation and configuration steps in README.

### Ejection Mechanism
- [ ] Configure Webpack/Next.js resolver to prioritize `modules/` directory before `node_modules`.
- [ ] Provide CLI script or npm task (`npm run eject <module>`) that copies from `node_modules/@msaas/<module>` into `modules/<module>`.
- [ ] Document customization workflow.

### Docker & Local Dev
- [ ] Write Dockerfile (Node 20 Alpine) and ensure production build works.
- [ ] Create `docker-compose.yml` with `web` and `db` services (PostgreSQL 15).
- [ ] Add `postgres_data` volume and environment configuration for DATABASE_URL.
- [ ] Provide Makefile or npm scripts to run `docker-compose up`, migrations, and `npm run dev`.

### Starter Modules
- [ ] Implement `@msaas/auth` module (NextAuth.js, routes, Prisma schema, UI pages).
- [ ] Implement `@msaas/billing-stripe` module with Stripe integration (billing settings page, webhook handler stub).
- [ ] Ensure modules respect feature flags and fail gracefully when disabled.

### Documentation
- [ ] Update README with setup instructions, feature flag usage, module installation, and ejection examples.
- [ ] Add CONTRIBUTING.md detailing workflow, coding standards, and module publishing process.

## Milestone v2 – CLI Enhancements

### CLI Scaffolding
- [ ] Bootstrap `saas` CLI (Node/TypeScript) packaged with the repo.
- [ ] Implement `saas create <project-name>` command to clone template and configure env.

### Module Automation
- [ ] Implement `saas eject <module>` command that mirrors manual ejection, updates aliases, and records overrides.
- [ ] Add schema merge automation (invoke merge script post-eject and post-install).
- [ ] Automate feature flag updates when installing/ejecting modules.

### Developer Experience
- [ ] Provide CLI prompts for enabling/disabling modules during project creation.
- [ ] Add tests for CLI commands (unit + integration).

## Milestone v3 – Scale Readiness

### Infrastructure
- [ ] Introduce Redis caching layer integration (docker-compose service stub, env variables).
- [ ] Add background worker/queue architecture (BullMQ or similar) with sample job.
- [ ] Prepare Kubernetes manifests (Deployment, Service, ConfigMap, Secret) for web and worker services.

### Observability & Ops
- [ ] Add logging strategy (pino/winston) with structured logs.
- [ ] Integrate basic monitoring/health checks and readiness probes.

### Additional Modules & Extensibility
- [ ] Outline roadmap for alternative billing providers (e.g., Razorpay) under @msaas scope.
- [ ] Document scaling guidance (horizontal scaling, DB migrations, cache usage).

---

Use this checklist to create GitHub issues or project board items. Adjust scope per sprint and keep documentation synchronized with implementation progress.
