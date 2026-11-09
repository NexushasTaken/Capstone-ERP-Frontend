# A Demand Forecasting System for Furniture Supply Stores Using Predictive Analytics

A local, offline-capable inventory and order management system built for **CPRO Home Hardware**, a furniture supply store. It replaces manual sales recording with authenticated, role-based access for the Store Owner and Secretary, and adds four-week product demand forecasts using Singular Spectrum Analysis (SSA) so the store can restock before seasonal shortages. The system runs entirely on the store's own computer or local network, with no internet connection required for daily operation.

---

## Group Members & Roles
* *Castillano, Geraldyn* – Project Manager
* *Isip, Jerick Rupert* -  Lead Developer / Full Stack Developer
* *Aton, Kimpee - Cortez, Hanny* – Frontend / UI-UX Developer
* *Salibio, Cristian Paul* – Backend / Database Administrator

---

## Tech Stack
* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui on Base UI, TanStack Query, React Hook Form + Zod, Chart.js
* **Backend:** ASP.NET Core (.NET 9), Entity Framework Core 9 + Npgsql, FluentValidation, JWT authentication (HttpOnly cookie), ML.NET SSA forecasting, QuestPDF
* **Database:** PostgreSQL 16+ (18 recommended)
* **Tools & Version Control:** Git, VS Code, Node.js 20.9+, .NET 9 SDK, `dotnet-ef`, ESLint + Prettier, CSharpier

---

## System Requirements & Prerequisites

Before you begin, ensure you have the following installed on your local machine:

* **Node.js** 20.9 or newer (LTS) and npm
* **.NET 9 SDK**
* **PostgreSQL** 16 or newer, running on port `5432`
* **Entity Framework CLI** (`dotnet tool install --global dotnet-ef`)
* **Git**
* A current version of Chrome, Edge, or Firefox

The frontend and backend are separate repositories and must sit next to each other:

```
capstone/
├── Frontend/   ← this repository
└── Backend/
```

---

## Installation & Setup Instructions

Follow these step-by-step commands to set up the project locally.

### 1. Clone the Repositories

```bash
mkdir capstone && cd capstone
git clone https://github.com/NexushasTaken/Capstone-ERP-Frontend.git Frontend
git clone https://github.com/NexushasTaken/Capstone-ERP-Backend.git Backend
```

If you already cloned this frontend repository, clone the backend as its sibling instead:

```bash
git clone https://github.com/NexushasTaken/Capstone-ERP-Backend.git Backend
```

### 2. Install Frontend Dependencies

```bash
cd Frontend
cp .env.example .env
npm install
```

`.env` contains one setting that matters:

```env
BACKEND_API_URL=http://localhost:5176
NODE_TLS_REJECT_UNAUTHORIZED='0'
```

`BACKEND_API_URL` is the address of the ASP.NET backend. Change it only if the backend runs on a different host or port.

### 3. Install Backend Dependencies

```bash
cd ../Backend
dotnet restore
dotnet build
```

---

## Database Setup & Configuration

### 1. Start your local PostgreSQL server

Make sure PostgreSQL is running and accepting connections on port `5432`.

### 2. Create the development database and role

The backend's default connection string expects a database named `ERP` owned by the role `sa` with password `pass`. Create them with `psql`:

```sql
CREATE ROLE sa WITH LOGIN PASSWORD 'pass' CREATEDB;
CREATE DATABASE "ERP" OWNER sa;
```

If you prefer your own PostgreSQL credentials, skip this step and edit `Backend/appsettings.json` instead:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=ERP;User Id=your_user;Password=your_password;"
}
```

### 3. Apply the database schema

From the `Backend` folder:

```bash
dotnet ef database update
```

This runs every EF Core migration and creates the tables with the default lookup data the system needs: roles, order and stock statuses, units of measurement, standard discounts, and the two default accounts. It does **not** create sample products, orders, or sales.

---

## Running the Application

Run the backend and frontend in two separate terminals.

**Terminal 1 — Backend:**

```bash
cd Backend
dotnet run
```

The API starts at `http://localhost:5176`. In development, Swagger is available at `http://localhost:5176/swagger`.

**Terminal 2 — Frontend:**

```bash
cd Frontend
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

> `npm run devs` starts the frontend with an experimental HTTPS certificate. The `.env.example` disables TLS verification for that mode.

---

## How the Frontend Talks to the Backend

The browser never calls the ASP.NET backend directly. Frontend code in `src/services/*Api.ts` calls `/api/<Controller>/<action>` on the Next.js server. The catch-all route in `src/app/api/[...path]/route.ts` forwards that request to `BACKEND_API_URL/api/<Controller>/<action>` and attaches the `AccessToken` cookie (see `src/lib/server/backendProxy.ts`).

This means a new backend endpoint needs **no new Next.js route file**. Add a function to the matching service, then wrap it in a query or mutation hook.

Authentication uses a JWT stored in an HttpOnly cookie. The frontend never reads or stores the token itself; the proxy forwards it, and the backend enforces roles (`owner`, `secretary`) with `[Authorize(Roles = "...")]`.

---

## Development Workflow

The backend and frontend follow a layered structure. A typical feature is built from the database outward, then wired into a page.

### Backend: database → data → service → controller

1. **Model and schema** — add or change the entity in `Repository/Model/`, configure it in `Repository/DatabaseContext.cs`, then create a migration:
   ```bash
   dotnet ef migrations add "<lowercase words>"
   dotnet ef database update
   ```
2. **Data layer** — add EF queries in `Repository/Data/<Area>Data/`.
3. **Service layer** — add business logic, validation, and audit logging in `Repository/Services/<Area>/`.
4. **Controller** — keep it thin and return the standard response envelope:
   ```csharp
   StatusCode(200, _response.Status(200, true, "message", content))
   ```
5. **Verify** — `dotnet build`.

List endpoints are filtered, sorted, and paged. Paged responses carry `items`, `PageCount`, and `Rows`. Services call `PageQueryValidator.Ensure(page, pageSize)`, and every list, count, and aggregate query on a soft-deletable entity filters `IsActive`.

### Frontend: service → hook → view

1. **Type** — add the entity and API request/response shapes in `src/types/`.
2. **Service** — add a plain `fetch` function in `src/services/<area>Api.ts`.
3. **Hook** — wrap it in `useQuery` or `useMutation` inside the page's `_hooks/` folder.
4. **View** — build the page from `_components/` pieces (`XxxView`, `XxxTable`, `XxxFormModal`), using the existing `ModalState` and `optimisticUpdate()` patterns.

Put code used by one page in that page's `_components`, `_hooks`, or `_lib`. Move it to `src/components`, `src/hooks`, or `src/lib` once a second page needs it.

### Checks before committing

```bash
# Frontend
npx tsc --noEmit
npm run lint
npm run build

# Backend
dotnet csharpier format .
dotnet build
```

---

## Project Structure

```
Frontend/
  src/
    app/
      api/[...path]/        backend proxy
      auth/login/           sign-in page
      dashboard/            one folder per module:
        accounts/ audit-logs/ category/ driver/ forecast/
        inventory/ orders/ product/ purchases/ reports/
        sales/ unit/ account-settings/
    components/             shared UI and shadcn/ui primitives
    hooks/                  shared React hooks
    services/               one file per backend area
    types/                  entity and API shapes
    lib/                    formatters, permissions, query keys, proxy helpers

Backend/
  Controllers/              thin HTTP endpoints per module
  Repository/
    Data/                   EF Core queries
    Services/               business logic, validation, audit logging
    Model/                  entities
    ViewModel/              request and response DTOs
    Configuration/          validators, enums, helpers
  Migrations/               EF Core migrations
  Program.cs                DI, authentication, CORS, middleware
```

---

## Default Login Credentials

| Account | Email | Password | Role |
|---|---|---|---|
| System Owner | `owner@inventory.local` | `mypassword` | Owner |
| System Secretary | `secretary@inventory.local` | `mypassword` | Secretary |

These accounts are created during database setup. Change both passwords from **Account Settings** immediately after the first sign-in.

---

## Troubleshooting

| Problem | What to do |
|---|---|
| The frontend loads but every request fails | Confirm the backend is running on `http://localhost:5176` and that `BACKEND_API_URL` in `Frontend/.env` matches. |
| `dotnet ef database update` cannot connect | Check that PostgreSQL is running on port `5432` and that the role and database in `appsettings.json` exist. |
| Port `3000` or `5176` is already in use | Stop the process using the port, or change the frontend port with `npm run dev -- -p 3001` and update `BACKEND_API_URL`/CORS accordingly. |
| Sign-in succeeds but the dashboard redirects back to login | The `AccessToken` cookie was not set. Confirm the backend is reachable through the Next.js proxy, not called directly. |
| Forecast page is empty | Open the forecast screen once so the backend computes and stores the SSA results. |
