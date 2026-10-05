---
name: frontend-conventions
description: Project conventions for the Cpro Next.js 16 frontend (folder layout, naming, data fetching, modals, backend proxy). Use before adding or changing any page, component, hook, service, type or API call in this repo, and when reviewing frontend code here.
---

# Cpro frontend conventions

This codebase was refactored to use Next.js the way the framework intends. Follow these rules for new code, and match the files around the one you're changing.

The repo's `AGENTS.md` rule still applies: Next 16 differs from older versions, so check `node_modules/next/dist/docs/` before using a Next API you're unsure of (e.g. `RouteContext`, `proxy.ts`, metadata).

## 1. Where files go

```
src/
  app/                    routes only (URL = folder path)
    api/[...path]/        the single backend proxy
    dashboard/<page>/
      page.tsx            server component: `metadata` + render <XxxView />
      _components/        components only this page uses
      _hooks/             useQuery/useMutation hooks only this page uses
      _lib/               constants/helpers only this page uses
    dashboard/_components layout pieces (Sidebar, AuthGuard, DashboardShell) + home page
  components/             used by 2+ pages
  components/ui/          shadcn primitives. Add with `npx shadcn add`; don't hand-edit unless necessary
  hooks/                  shared hooks
  services/               plain fetch functions, one file per backend area
  types/                  one file per entity: UI types, then `// API request/response shapes`
  lib/                    shared non-React code (format.ts, permissions.ts, query/, helpers/)
  lib/server/             server-only code (backend proxy)
```

**The rule:** if only one route uses it, it goes in that route's `_components` / `_hooks` / `_lib`. Once a second route needs it, move it to `src/components` / `src/hooks` / `src/lib`. Folders starting with `_` are private (never URLs).

Don't create new `types` files for component props. Props interfaces live in the component file (`interface XxxProps`) and aren't exported unless another file needs them.

## 2. Naming

| Kind | Name | Example |
|---|---|---|
| Page's top client component | `XxxView` | `ProductsView`, `OrdersView` |
| Big page region | `XxxSection` / `XxxCard` | `WarehouseCapacitySection`, `SalesOverviewCard` |
| Table / list | `XxxTable` / `XxxList` / `XxxRow` | `ProductsTable`, `OrderRow` |
| Add + edit in one modal | `XxxFormModal` | `CategoryFormModal` |
| Other modals | `XxxModal` | `RestockModal`, `ProductDetailsModal` |
| Real `<form>` | `XxxForm` | `LoginForm`, `CredentialsForm` |
| Page data hooks | `useXxx` + `useXxxMutations` | `useCategories`, `useCategoryMutations` |

Use "Form" only for components that really are a form. Never name a page component `*Form`.

Files are PascalCase for components and camelCase for everything else. Default-export components. Import siblings with `./X` and the page's own folders with `../_hooks/...`. Everything else uses the `@/` alias.

## 3. Pages

`page.tsx` stays a thin server component:

```tsx
import type { Metadata } from 'next'
import ProductsView from './_components/ProductsView'

export const metadata: Metadata = { title: 'Products' }   // shown as "Products | Cpro"

export default function ProductsPage() {
  return <ProductsView />
}
```

Put `'use client'` only on components that use state, effects, hooks or event handlers. Layout-only components (e.g. `InventoryView`, `DashboardView`) stay server components.

## 4. Talking to the backend

The browser → `/api/<Controller>/<action>` (Next) → `BACKEND_API_URL/api/<Controller>/<action>`, with the `AccessToken` cookie attached by `src/lib/server/backendProxy.ts`.

- **Never add a route file per endpoint.** The catch-all `src/app/api/[...path]/route.ts` already forwards everything. Only add a specific route when it must do extra work first. In that case reuse `proxyToBackend(request, path, search)` (see `api/Inventory/movement/velocity/route.ts`).
- Endpoints callable without a login go in `PUBLIC_PATHS` in `backendProxy.ts`.
- To add a call, write a function in `src/services/<area>Api.ts`. Copy the existing style: `fetch('/api/...', { credentials: 'include' })`, parse `ApiEnvelope<T>` from `@/types/api`, and throw `Error(data.message || '...')` when it isn't `ok`/`success`.

## 5. Data fetching (TanStack Query **v4**, a v5 upgrade is planned)

- Components never call `useQuery` with a service directly. Wrap it in a hook in the page's `_hooks/` (or `src/hooks/` if shared):

```ts
export function useDrivers(params: FetchDriversParams) {
  return useQuery({
    queryKey: queryKeys.drivers.all(params),
    queryFn: ({ signal }) => fetchDrivers(params, signal),
    keepPreviousData: true,
  })
}
```

- Query keys come only from `src/lib/query/queryKeys.ts`. Add new keys there, prefixed by the entity (`['products', params]`), so `invalidateQueries({ queryKey: ['products'] })` hits them all.
- Mutations live in `useXxxMutations()`, which returns `{ addX, updateX, deleteX, isSubmitting }`.
- For list pages that update instantly, spread `optimisticUpdate()` from `src/lib/query/optimisticUpdate.ts`:

```ts
const deleteDriver = useMutation({
  mutationFn: deleteDriverApi,
  ...optimisticUpdate<DriversResponse, number>({
    queryClient,
    queryKey: listQueryKey,          // the exact cached page
    scopeKey: ['drivers'],           // cancelled before, refetched after
    update: (current, id) => ({ ...current, items: current.items.filter((d) => d.id !== id) }),
    successMessage: 'Driver deleted successfully',
    errorMessage: 'Failed to delete driver',
  }),
})
```

  If the optimistic row needs display data the API payload lacks (category or warehouse name), add it to the mutation variables and strip it in `mutationFn`. See `ProductValues.categoryName`.
- Audit logs refresh automatically after any mutation (`MutationCache` in `src/app/providers.tsx`). Don't add manual audit-log invalidation.
- Debounce search with `useDebouncedValue(search.trim())`. Reset to page 1 in the input's `onChange`, not in an effect.

## 6. Modals

- Keep one piece of state per page that says which modal is open, never a boolean per modal:

```ts
type ModalState =
  | { type: 'add' }
  | { type: 'edit'; category: CategoryListItem }
  | { type: 'delete'; category: CategoryListItem }
  | null
const [modal, setModal] = useState<ModalState>(null)
```

- Add and edit share one `XxxFormModal` that takes the item or `null`. It owns its form state and calls `onSubmit(values)`. The parent decides add vs. update, runs the mutation and closes the modal.
- Render form modals **only while open** (`{modal?.type === 'edit' && <XxxFormModal ... />}`) so fields start fresh. The exception is when a draft must survive closing (create-order, add-inventory). Then keep it mounted with an `open` prop, and reset it with a `key` bump on success.
- Build modals from `AppModal` plus `ModalHeader` / `ModalBody` / `ModalActions` (`@/components/AppModal`). Deletes use `DeleteConfirmModal`, and read-only "See more" views use `SeeMoreModal`.
- Labelled inputs inside modals use `FormField` + `FormInput` (`@/components/FormField`).

## 7. Shared building blocks (use them, don't re-copy markup)

`PageTitle` (title + count badge, `as="h2"` inside a page with its own h1), `SearchInput`, `ExportCsvButton` (has its own cooldown), `SortPopover`, `TablePagination`, `StatusAction` (row "…" menu), `EntityDropdown` (searchable picker), `OrderTypeFilterSelect`, `Loading`, `DatePickerSimple`.

Hooks: `useCurrentUser`, `useDebouncedValue`, `useCooldown`, `useOrderTypes`, `useInventoryProductSearch`, `useAuditLogs`.

Formatting: `formatDate` and `formatPeso` come only from `@/lib/format`. Never write another copy.

## 8. Permissions

`src/lib/permissions.ts` is UI-only role gating; the backend enforces the real rules.
- Hide buttons with `can(role, '<module>:<action>')`.
- Filter row menus with `allowedActions(role, '<module>', items)`. The action `value`s must match the keys in `permissions.ts`.
- `role` comes from `useCurrentUser().data?.role`.
- Roles are lowercase (`owner`, `secretary`).

## 9. Styling

- Tailwind classes only, and `cn()` from `@/lib/utils` for conditional classes.
- **Planned:** hex colors will move to shadcn's default neutral theme classes. The user chose the stock theme, so don't invent custom tokens:

  | Hex | Class |
  |---|---|
  | `#121514` | `text-foreground` |
  | `#737A76` | `text-muted-foreground` |
  | `#DFE2E0` | `border-border` |
  | `#DCE4DF` | `hover:bg-accent` |

  Until that pass happens, match the surrounding file.
- Modals and tables are planned to move onto shadcn `Dialog`/`Table` behind the existing `AppModal`/`ModalHeader` API. Keep using that API so the swap stays in one place.

## 10. Before finishing a change

```bash
npx tsc --noEmit && npm run lint && npm run build
```

If `tsc` complains about missing `route.js`/`layout.js` under `.next/`, those are stale generated types. Run `npx next typegen` (and remove `.next/dev/types`), then rerun.

Remove dead code instead of commenting it out (git keeps history). Don't leave `console.log` behind. Keep commit messages as `refactor(<page>): ...` / `feat(<page>): ...`.
