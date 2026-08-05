# Multi-Tenant Next.js Folder Structure — Reusable Template

This is a generic blueprint extracted from a working multi-tenant SaaS. It is a
**pattern**, not a literal folder listing — swap the placeholder names
(`admin-app`, `operator-app`, `public-app`, feature names) for whatever your
new project actually needs.

## Root layout

```
your-app/
  app/                    ← Next.js App Router
  components/             ← shared, cross-route UI components
    ui/                   ← low-level primitives (button, dialog, input, ...)
  hooks/                  ← shared React hooks (use-x.ts)
  services/               ← API/data-access layer (x.service.ts)
  store/                  ← global client state (x.store.ts)
  types/                  ← shared TypeScript types (x.types.ts)
  constants/              ← config.ts, routes.ts, other static values
  lib/                    ← framework glue: auth.ts, axios.ts, utils.ts
  proxy.ts                ← tenant-resolution proxy (see TENANT_ARCHITECTURE.md)
  next.config.ts
  tsconfig.json           ← path alias "@/*" → "./*"
```

The path alias (`@/*` → repo root) is what makes the flat `components/`,
`hooks/`, `services/`, `store/`, `types/`, `constants/`, `lib/` folders work
well: any file anywhere can `import { x } from "@/services/x.service"`
without relative-path spaghetti.

## `app/` route-group pattern

```
app/
  (marketing)/                        ← public site, no tenant context
    layout.tsx
    page.tsx

  [tenant]/                           ← dynamic segment, one per tenant
    layout.tsx                        ← resolves + validates the tenant, 404s if unknown

    (admin-app)/                      ← authenticated, tenant-owner-facing surface
      layout.tsx                      ← auth guard + shell (sidebar/topbar)
      feature-a/
        page.tsx
      feature-b/
        page.tsx
      ...

    (operator-app)/                   ← internal staff-facing surface (e.g. POS, ops console)
      workspace/
        layout.tsx
        page.tsx
        sub-view-a/
          page.tsx
        _components/                  ← route-local, not routable (underscore prefix)
        _hooks/
        _services/

    (public-app)/                     ← end-customer-facing surface, no auth
      entry/[entryId]/
        page.tsx
        _templates/                   ← swappable presentation layer
          template-a/
          template-b/
          _shared/                    ← logic shared by all templates
            _types/
            _services/
            _hooks/
            _screens/
            _components/

  platform-admin/                     ← cross-tenant super-admin, separate auth
    (panel)/
      layout.tsx
      page.tsx
      resource-a/
        page.tsx
        [slug]/
          page.tsx
    login/
      page.tsx

  actions/                            ← server actions
    revalidate.ts
```

### Why three surfaces under `[tenant]/`

- **`(admin-app)`** — the tenant owner's dashboard. One folder per feature
  area, each with its own `page.tsx`. Auth-gated at the group's `layout.tsx`.
- **`(operator-app)`** — a different auth/role boundary for internal staff
  (e.g. point-of-sale, fulfillment console). Kept as a separate route group
  so it can have its own layout/shell without leaking into the admin app.
- **`(public-app)`** — the surface end users hit with no login (e.g. a
  QR-code landing page). Supports a **template system**: multiple
  interchangeable presentation layers (`_templates/<name>/`) that all consume
  the same shared services/hooks/types (`_templates/_shared/`), so the visual
  design can be swapped per tenant without touching business logic.

Route groups (parenthesized folders) don't affect the URL — they only let you
attach a distinct `layout.tsx`/auth boundary to a subset of routes.

## Domain-folder naming convention

Every cross-cutting concern gets **one file per feature domain**, named
consistently:

```
services/feature-x.service.ts   ← API calls for "feature-x"
store/feature-x.store.ts        ← Zustand/global state for "feature-x"
types/feature-x.types.ts        ← shared TS types for "feature-x"
hooks/use-feature-x.ts          ← React hook wrapping the store/service
```

Services re-export their types from `types/feature-x.types.ts` so consumers
can import from either the service file or the types file interchangeably.

## Route-local (`_`-prefixed) folders

Inside a route group, an underscore-prefixed folder is invisible to the Next.js
router (not routable) and scopes code to that route tree only:

```
_components/   ← UI used only within this route
_hooks/        ← hooks used only within this route
_services/     ← API calls used only within this route
_types/        ← types used only within this route
_screens/      ← full-screen views composed from the above (for multi-screen flows)
```

Use this when logic is genuinely local to one part of the app (e.g. one
template variant, one operator workspace). Promote to the shared top-level
folder (`services/`, `hooks/`, etc.) only once a second consumer needs it.

## Checklist for bootstrapping a new project from this pattern

1. Set up `tsconfig.json` path alias `@/*` → `./*`
2. Create the flat domain folders: `components/`, `hooks/`, `services/`,
   `store/`, `types/`, `constants/`, `lib/`
3. Create `app/(marketing)/` for the public/no-tenant site
4. Create `app/[tenant]/layout.tsx` as the tenant-resolution gate
5. Add one route group per distinct auth/role surface under `[tenant]/`
6. If there's an end-customer-facing surface with variable presentation,
   set up the `_templates/<name>/` + `_templates/_shared/` split from day one
   — retrofitting it later means threading a template prop through every
   screen
7. Add `platform-admin/` only if you need a cross-tenant super-admin surface
