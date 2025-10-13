# Modular SaaS Starter Kit

The starter kit now ships as a working multi-tenant link management SaaS reference on top of Next.js 15 App Router. Feature
modules are ejected into `/modules`, Prisma schemas are merged on install, and the UI is composed with shadcn/ui +
Tailwind.

## Current Status
- Marketing and docs surfaces (`/`, `/pricing`, `/docs/*`, `/billing`) are production-style and demonstrate module gating.
- Auth module delivers email/password registration, invite acceptance, session cookies, and workspace bootstrapping flows.
- Workspace experience includes organization creation, quickstart checklist, link CRUD with tags, analytics dashboards,
  custom domain requests, API key management, and billing overview cards backed by Prisma services.
- Admin console provides a control center with metrics, organization and user management, payments tables, audit log
  pagination, and configuration editors that persist to `config/features.json`, `config/pricing.json`, and
  `config/integrations.json`.
- Stripe billing module exposes a customer-facing billing stub, enforces plan limits, and seeds webhook documentation; plan
  limits power usage gating across the app.

## Active Modules
- **Auth (`modules/auth`)** — custom session auth layer with server actions for sign in/out, invite acceptance, password
  hashing, and user bootstrap helpers (`@modules/auth/actions`).
- **Stripe Billing (`modules/billing-stripe`)** — billing dashboard surface, credential forms, and webhook guidance that
  integrates with workspace billing settings and plan enforcement in `@lib/server/billing`.
- **Core workspace** — multi-tenant organization management, link lifecycle utilities, analytics aggregation, audit log
  recording, custom domain verification tokens, invitations, and API key issuance.

## Next Focus
- Wire the Stripe module to live API/webhook flows and expose portal actions.
- Expand the public API surface and edge redirect service (`/r/*`) to match the PRD.
- Harden auth (password reset, MFA) and add CLI automation for module ejection/installation.
