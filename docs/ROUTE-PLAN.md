# Route Architecture Plan

Updated to align with the current routing tree. Status legend: ✅ Implemented, ⚠️ Implemented (demo/stub data), 🟡 Planned.

## Public Marketing & Docs

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| ✅ | `/` | Marketing landing page with primary CTAs to register or log in. | Highlights value props, funnels to `/sign-in`. |
| ✅ | `/pricing` | Pricing comparison for Starter, Growth, and Enterprise plans. | Keep copy aligned with admin pricing config edits. |
| ✅ | `/docs/getting-started` | Quickstart documentation for new workspaces. | Linked from the auth and onboarding surfaces. |
| ✅ | `/docs/workspaces` | Guidance on structuring teams and environments. | Supports `/app/new` guidance. |
| ✅ | `/docs/ejection` | Explains module ejection workflow. | References `/modules/*` overrides and merge script. |
| ⚠️ | `/billing` | Stripe billing module showcase. | Form UI is wired but stores demo values until live API integration lands. |

## Authentication

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| ✅ | `/sign-in` | Combined login, registration, and invite acceptance flow. | Supports `mode`, `redirectTo`, `invite`, and `email` query params; redirects signed-in users. |

## Workspace Entry

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| ✅ | `/app` | Auth gate that forwards members to their first organization or `/app/new`. | Redirects unauthenticated users to `/sign-in`. |
| ✅ | `/app/new` | Workspace creation flow. | Bootstraps quickstart checklist and links to `/docs/workspaces`. |

## Workspace Surfaces (`/app/[orgSlug]`)

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| ✅ | `/app/[orgSlug]` | Organization dashboard with usage metrics and launch checklist. | Pulls analytics summary and plan limit reminders. |
| ✅ | `/app/[orgSlug]/links` | Link creation form and link table. | Server action enforces plan limits, supports tagging, revalidates list view. |
| ✅ | `/app/[orgSlug]/analytics` | Analytics snapshot (timeline, referrers, geo). | Marks quickstart checklist step on first visit. |

## Workspace Settings

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| ✅ | `/app/[orgSlug]/settings` | Settings hub with profile updates and plan summary. | Owners can soft-delete workspace; provides plan CTA. |
| ✅ | `/app/[orgSlug]/settings/billing` | Billing overview and usage callouts. | Reads Prisma subscription data and plan limits; exposes Stripe portal CTA. |
| ✅ | `/app/[orgSlug]/settings/members` | Member roster and invitation management. | Invite/revoke flows, role badges, pending invite list with revoke action. |
| ✅ | `/app/[orgSlug]/settings/domains` | Custom domain requests and status tracking. | Issues verification tokens, enforces plan allowances, allows removal. |
| ✅ | `/app/[orgSlug]/settings/api-keys` | API key issuance and revocation. | Generates hashed secrets, tracks last-used timestamps, logs actions. |
| 🟡 | `/app/[orgSlug]/settings/security` | Advanced security controls (MFA, SSO). | Not yet implemented; keep reserved in roadmap. |

## Admin Console (`/admin`)

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| ✅ | `/admin` | Platform health dashboard. | Requires admin middleware; aggregates MRR, org/user counts, churn. |
| ✅ | `/admin/orgs` | Organization directory with plan/status controls. | Suspend/reactivate workspaces, change plan tier. |
| ✅ | `/admin/users` | Platform user management. | Super admins can adjust platform roles; supports block/unblock actions. |
| ✅ | `/admin/payments` | Stripe payments, invoices, and refunds overview. | Uses live Stripe API when keys exist; falls back to Prisma subscriptions otherwise. |
| ✅ | `/admin/settings` | Pricing, feature flag, and integration configuration. | Persists edits to `config/features.json`, `config/pricing.json`, and `config/integrations.json`. |
| ✅ | `/admin/logs` | Paginated audit log review. | Includes simple pagination and actor metadata. |

## API & Edge Surfaces

| Status | Path | Purpose | Notes |
| --- | --- | --- | --- |
| 🟡 | `/api/links`, `/api/orgs`, `/api/invites`, `/api/domains` | Programmatic access to core resources. | Routes not yet implemented—tracked as backlog against the PRD. |
| 🟡 | `/api/webhooks/stripe` | Stripe webhook receiver. | Documented in billing module; implementation pending. |
| 🟡 | `/r/[slug]`, `/r/[domain]/[slug]` | Edge redirect service for short links. | Redirect logic still to be built; must log click events when added. |

## Supporting Considerations

- Middleware enforces platform admin roles for `/admin/*`, redirecting non-admins to `/app`.
- Plan enforcement lives in `@lib/server/links` and `@lib/server/domains`; update limits there when adding tiers.
- Configuration editors write to file-backed config; ensure deployment targets can persist or sync overrides.
- Redirect and API work should reuse existing analytics, audit logging, and API key helpers to maintain consistency.
