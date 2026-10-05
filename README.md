# Cpro Frontend

Next.js 16 (App Router), React 19, TanStack Query, Tailwind CSS 4 and shadcn/ui (on Base UI).

## Getting started

```bash
cp .env.example .env   # BACKEND_API_URL points at the ASP.NET backend
npm install
npm run dev            # http://localhost:3000
```

Useful checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## How requests reach the backend

The browser never calls the backend directly. Code in `src/services/*Api.ts` calls
`/api/<Controller>/<action>` on this Next.js server. `src/app/api/[...path]/route.ts`
forwards that to `BACKEND_API_URL/api/<Controller>/<action>` and attaches the
`AccessToken` cookie (see `src/lib/server/backendProxy.ts`). A new backend endpoint
needs no new route file. Add a function in the matching service instead.

## Folder layout

```
src/
  app/                      routes (URL = folder path)
    api/[...path]/          the backend proxy
    auth/login, auth/signup
    dashboard/
      layout.tsx            sidebar + auth check around every dashboard page
      _components/          layout pieces and the dashboard home page
      product/              one folder per page:
        page.tsx              sets the title, renders the view
        _components/          ProductsView (state + layout), table, modals
        _hooks/               useProducts: queries and mutations for this page
        _lib/                 constants and helpers only this page uses
  components/               shared by 2+ pages (modals, search box, pagination...)
    ui/                     shadcn/ui primitives, added with `npx shadcn add`
  hooks/                    shared hooks (useCurrentUser, useDebouncedValue...)
  services/                 one file per backend area, plain fetch functions
  types/                    one file per entity (UI types + API request/response shapes)
  lib/                      shared non-React code: formatters, permissions, query keys
```

Folders starting with `_` are private: Next.js never turns them into URLs, so they
are a safe place to keep a page's own files next to it.

### Where does new code go?

- Only one page uses it: put it in that page's `_components`, `_hooks` or `_lib`.
- Two or more pages use it: put it in `src/components`, `src/hooks` or `src/lib`.
- Talks to the backend: add a function in `src/services`, then wrap it in a
  `useQuery`/`useMutation` hook in the page's `_hooks` folder.

### Naming

- `XxxView`: a page's top-level client component (state + layout).
- `XxxTable`, `XxxModal`, `XxxFormModal` (add + edit in one), `XxxSection`, `XxxCard`.
- `Form` only appears in a name when the component really is a `<form>`
  (`LoginForm`, `CredentialsForm`).

### Patterns used on every list page

- `ModalState`: one `useState` saying which modal is open and for which row,
  instead of a boolean per modal.
- Add/edit modals are only rendered while open, so their fields start fresh.
- `optimisticUpdate()` (in `src/lib/query`) updates the table instantly and rolls
  back with an error toast if the request fails.
