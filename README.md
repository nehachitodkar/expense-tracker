## Expense Tracker – Full‑Stack App

Modern expense tracking app with:

- **Frontend**: Next.js 14, React 18, TailwindCSS, Chart.js
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: SQLite (file‑based, no external DB needed)

---

## 1. Prerequisites

- **Node.js**: v18+ (recommended v20)
- **npm**: v9+
- Git (to clone the repo)

---

## 2. Clone the Repo

```bash
git clone <YOUR_REPO_URL> expense-tracker
cd expense-tracker
```

> If this code lives inside another repo, just `cd` into that `expense-tracker` directory instead of cloning.

---

## 3. Install Dependencies (Monorepo)

From the `expense-tracker` root:

```bash
npm install
```

This installs dependencies for:

- `backend` (Express + Prisma)
- `frontend` (Next.js + Tailwind)

---

## 4. Configure Environment Variables

### 4.1 Backend `.env`

In `backend/.env`:

```bash
DATABASE_URL="file:../database/prisma/dev.db"

JWT_SECRET="a-strong-random-secret"

PORT=4000
FRONTEND_ORIGIN="http://localhost:3000"
NODE_ENV=development
```

### 4.2 Frontend `.env.local` (optional)

If you keep the backend at `http://localhost:4000`, you can skip this.

In `frontend/.env.local` (create if missing):

```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

---

## 5. Initialize the SQLite Database (Prisma)

From the `expense-tracker` root:

```bash
# Run migrations – creates ./database/prisma/dev.db
npx prisma migrate dev --schema=./database/prisma/schema.prisma --name init

# Generate Prisma client
npx prisma generate --schema=./database/prisma/schema.prisma
```

This sets up the `User` and `Expense` tables in a local SQLite file.

---

## 6. Run the App

### 6.1 Run Backend Only

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:4000`.

### 6.2 Run Frontend Only

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 6.3 Run Full Stack Together (Recommended)

From the `expense-tracker` root:

```bash
npm run dev
```

This uses the root `package.json` scripts to start:

- Backend dev server
- Frontend dev server

---

## 7. Available Pages & Features

- **`/login`** – Log in with email + password (JWT stored in `localStorage`)
- **`/signup`** – Create a new account
- **`/dashboard`** – Monthly total, category breakdown (pie chart), spending trend (line chart)
- **`/expenses`** – Paginated table with:
  - Date, Category, Description, Amount, Actions
  - Search/filter, Add/Edit modal, Delete
- **`/profile`** – View basic user information
- **`/`** – Redirects to `/login` or `/dashboard` based on auth

All expense and analytics endpoints are protected by JWT auth on the backend.

---

## 8. Testing

### 8.1 Frontend Tests

```bash
cd frontend
npm test
```

Runs Jest + React Testing Library (sample tests included).

### 8.2 Backend Tests

```bash
cd backend
npm test
```

Jest is configured; you can add more tests under `backend/tests`.

---

## 9. Notes

- Database is **SQLite**, so data is stored in `database/prisma/dev.db`.
- To reset the DB, you can delete `dev.db` and re‑run the Prisma migrate command.
- For production, you can swap the Prisma datasource to Postgres or another supported DB and create new migrations.
