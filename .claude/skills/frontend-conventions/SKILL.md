---
name: frontend-conventions
description: Project conventions for the Cpro Next.js 16 frontend (folder layout, naming, data fetching, modals, forms and validation, backend proxy). Use before adding or changing any page, component, hook, service, type or API call in this repo, and when reviewing frontend code here.
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
| Big page region | `XxxSection` / `XxxCard` | `InventoryItemsSection`, `SalesOverviewCard` |
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

## 5. Data fetching (TanStack Query **v5**)

- Components never call `useQuery` with a service directly. Wrap it in a hook in the page's `_hooks/` (or `src/hooks/` if shared):

```ts
export function useDrivers(params: FetchDriversParams) {
  return useQuery({
    queryKey: queryKeys.drivers.all(params),
    queryFn: ({ signal }) => fetchDrivers(params, signal),
    placeholderData: keepPreviousData,   // import { keepPreviousData } from '@tanstack/react-query'
  })
}
```

- Loading flags: a query's `isLoading` (first fetch in flight) drives spinners. Don't use `isPending` for that, because it stays true while a query is disabled. Mutations use `isPending`. `@tanstack/eslint-plugin-query` recommended rules are on.
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

## 7. Forms and validation (zod + react-hook-form)

Every form uses a zod schema with `useForm({ resolver: zodResolver(schema), mode: "onTouched", defaultValues })`. Don't hand-roll `useState` + `canSubmit` checks.

- **Schema location:** in the route's `_lib/<entity>Schema.ts`, exporting the schema and `type XxxFormValues = z.infer<typeof xxxSchema>`. Rules that match the backend (email regex, password length, required string, positive int, required id) come from `@/lib/validation`. Reuse them, and keep their messages in line with the backend's FluentValidation messages.
- **Inputs:**
  - plain inputs: `<FormInput {...register("name")} />`
  - number inputs: `register("price", { valueAsNumber: true })`. An empty input becomes NaN, which `requiredNumber`/`positiveInt` reject.
  - custom inputs (`EntityDropdown`, `RoleSelect`, shadcn `Select`, `DatePickerSimple`): wrap in `<Controller>`.
  - dynamic rows: `useFieldArray` (see `OrderLinesEditor`, which reads the form through `useFormContext` inside a `<FormProvider>`).
- **Errors:** `<FormField label="…" error={errors.x?.message}>` plus `aria-invalid={!!errors.x}` on the input. `SettingsField` and `DatePickerSimple` take an `error` prop too.
- **Submit button:** `confirmDisabled={!isValid || disabled}`, and submit with `handleSubmit(onSubmit)`, which only runs when the schema passes and gives parsed values. Read live values with `useWatch`, not `watch()`, because the React Compiler can't memoize `watch`.
- **Conditional rules:** if a rule depends on other data (walk-in orders, add vs. edit, available stock), build the schema with a function (`orderSchema(isWalkin)`, `inventorySchema(isEdit)`, `damageSchema(available)`). Cross-field checks use `.refine(..., { path: ["field"] })` plus `deps` on the field that triggers them.
- **Server errors:** a 400 from the backend has `errors: { "camelCase.path": [messages] }`. Services throw `ApiError` (`@/lib/apiError`), which carries them as `fieldErrors`. Forms that wait for the server (create account, settings, login) call `applyServerErrors(err, setError)` in `onError`/`catch`. It puts each message under its field (or in `errors.root.server`) and returns true so you skip the toast. Optimistic modals close on submit, so their server failures stay as toasts. That's why their schemas must cover every backend rule.

## 8. Shared building blocks (use them, don't re-copy markup)

`PageTitle` (title + count badge, `as="h2"` inside a page with its own h1), `SearchInput`, `ExportCsvButton` (has its own cooldown), `SortPopover`, `TablePagination`, `StatusAction` (row "…" menu), `EntityDropdown` (searchable picker), `OrderTypeFilterSelect`, `Loading`, `DatePickerSimple`.

Hooks: `useCurrentUser`, `useDebouncedValue`, `useCooldown`, `useOrderTypes`, `useInventoryProductSearch`, `useAuditLogs`.

Formatting: `formatDate` and `formatPeso` come only from `@/lib/format`. Never write another copy.

## 9. Permissions

`src/lib/permissions.ts` is UI-only role gating; the backend enforces the real rules.
- Hide buttons with `can(role, '<module>:<action>')`.
- Filter row menus with `allowedActions(role, '<module>', items)`. The action `value`s must match the keys in `permissions.ts`.
- `role` comes from `useCurrentUser().data?.role`.
- Roles are lowercase (`owner`, `secretary`).

## 10. Styling

- Tailwind classes only, and `cn()` from `@/lib/utils` for conditional classes.
- Colours come only from the stock shadcn neutral theme in `globals.css`. **Never write `[#hex]` classes or invent tokens.**
  - Text uses `text-foreground` / `text-muted-foreground`.
  - Lines use `border` / `border-border`.
  - Surfaces use `bg-muted` (`bg-muted/50` for the lightest) and `bg-background`.
  - Hover uses `hover:bg-accent`.
  - Solid/selected elements use `bg-primary text-primary-foreground`.
  - Errors use `text-destructive` / `bg-destructive/10`.
  - Focus uses `ring-ring` / `border-ring`.
- Status colours keep their meaning, using Tailwind's palette:
  - success `text-green-700` / dot `bg-green-600`
  - warning `text-amber-700` / dot `bg-amber-500`
  - error `text-destructive` / dot `bg-destructive`
  - unknown `text-muted-foreground`
- Charts: Chart.js can't read oklch, so get colours with `themeColor('--chart-5')` from `@/lib/cssColor` inside the effect. The sales pie's fixed multi-colour list is the one allowed exception.
- `Button`, `Input`, `SelectTrigger`, `Textarea`, `Toggle` and `Badge` already have the app's rounded shape in `components/ui`. Only pass layout classes (`w-full`, `h-9`, `ml-auto`) to them. Never re-add `rounded-xl px-3 py-2 text-sm border-border`. Use `<Button variant="outline" size="sm">` for row buttons (“See more”, “View”) instead of a styled `<button>`.
- Modals use `AppModal` (shadcn Dialog). For a custom header, use `ModalTitle` for the title so the dialog stays labelled. List pages render their table through `DataTable` (`@/components/DataTable`), with `TableRow`/`TableCell` children. Use `rowGroups` when each row is its own `<tbody>` (expandable rows).
- The font is Host Grotesk via `--font-sans` / `--font-heading`. Don't use `font-mono` for UI text.

## 11. Before finishing a change

Format first, then check, then commit:

```bash
npm run format && npx tsc --noEmit && npm run lint && npm run build
```

`npm run format` is Prettier (`.prettierrc`: double quotes, no semicolons, 2 spaces, width 120). It skips `src/components/ui` (shadcn-generated) and the agent docs. Keep pure reformatting out of feature commits.

If `tsc` complains about missing `route.js`/`layout.js` under `.next/`, those are stale generated types. Run `npx next typegen` (and remove `.next/dev/types`), then rerun.

Remove dead code instead of commenting it out (git keeps history). Don't leave `console.log` behind. Keep commit messages as `refactor(<page>): ...` / `feat(<page>): ...`.
