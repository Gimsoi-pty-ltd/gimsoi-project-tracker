# Gimsoi Project Tracker

Gimsoi Project Tracker is a full-stack project delivery platform for managing projects, sprints, tasks, teams, clients, reports, and delivery analytics.

## Tech stack

| Area     | Technologies                                                        |
| -------- | ------------------------------------------------------------------- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Zustand, Recharts |
| Backend  | Node.js, Express 5, Zod 4, JWT authentication, Playwright API tests |
| Database | Prisma ORM 7, Prisma Postgres, PostgreSQL driver adapter            |

## Repository layout

```text
apps/
  frontend/       React web application
  backend/        Express API, Prisma schema, migrations, and seed data
docs/              Architecture, API, product, security, and onboarding notes
infra/             CI, deployment, security, and hosting configuration
packages/shared/   Shared package workspace
```

## Prerequisites

- Node.js 22.12 or newer
- npm
- Git
- Access to the project's PostgreSQL database, or another development database

## Quick start

Clone the repository:

```bash
git clone https://github.com/Gimsoi-pty-ltd/gimsoi-project-tracker.git
cd gimsoi-project-tracker
```

### 1. Configure and start the backend

```bash
cd apps/backend
```

Copy `apps/backend/.env.example` to `apps/backend/.env`, then replace every placeholder. Never commit `.env` or paste its values into logs or issues.

Create `.env` before installing because the backend's post-install step loads the Prisma configuration and generates the client. Then install the locked dependencies:

```bash
npm ci
```

Required for local development:

| Variable       | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma and the API |
| `JWT_SECRET`   | Secret used to sign authentication tokens               |

Common optional settings:

| Variable                   | Default or purpose                                |
| -------------------------- | ------------------------------------------------- |
| `PORT`                     | Backend port; defaults to `5001`                  |
| `NODE_ENV`                 | Use `development` locally                         |
| `CLIENT_URL`               | Frontend origin; normally `http://localhost:5173` |
| `GMAIL_USER`               | Gmail account used for application email          |
| `GMAIL_APP_PASSWORD`       | Gmail app password, not the account password      |
| `CSRF_SECRET`              | Required in production                            |
| `DB_POOL_MAX`              | Maximum PostgreSQL pool size                      |
| `DB_CONNECTION_TIMEOUT_MS` | Database connection timeout                       |
| `DB_IDLE_TIMEOUT_MS`       | Idle connection timeout                           |

Validate the Prisma setup and start the API:

```bash
npx prisma validate
npx prisma generate
npm run dev
```

The API runs at http://localhost:5001/api. Useful development endpoints:

- Health: http://localhost:5001/api/health
- Swagger UI: http://localhost:5001/api/docs

### 2. Start the frontend

Open another terminal from the repository root:

```bash
cd apps/frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` requests to the backend on port `5001`.

## Prisma workflow

Run Prisma commands from `apps/backend` so the CLI finds `prisma.config.ts`.

```bash
npx prisma validate     # validate prisma/schema.prisma
npx prisma generate     # regenerate the client in lib/generated/prisma
npx prisma studio       # inspect the configured database
npx prisma db seed      # write the configured starter data
```

The seed command runs `node prisma/seed.js`, as configured in `prisma.config.ts`.

### Database safety

- `npm run db:setup` uses `prisma db push --force-reset` and deletes existing data.
- `npm run test:api` resets and truncates database tables during test setup.
- `npx prisma db seed` clears existing domain data and writes demo records to the selected database.
- Never run these commands against the shared or production database. Use a disposable test database.
- The legacy migration history needs cleanup before it can be safely replayed on a completely fresh database.

## Available commands

### Frontend (`apps/frontend`)

| Command           | Purpose                           |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the Vite development server |
| `npm run lint`    | Run ESLint                        |
| `npm run build`   | Create a production build         |
| `npm run preview` | Preview the production build      |

### Backend (`apps/backend`)

| Command            | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start the API with automatic restart            |
| `npm start`        | Start the API with Node.js                      |
| `npm run db:seed`  | Run the JavaScript seed directly                |
| `npm run db:setup` | Force-reset, synchronize, and seed the database |
| `npm run test:api` | Run the destructive API integration suite       |

## Verification

Safe checks for the configured development environment:

```bash
cd apps/backend
npm ls --depth=0
npx prisma validate
npx prisma generate

cd ../frontend
npm ls --depth=0
npm run lint
npm run build
```

## Documentation

- [Architecture](docs/architecture/README.md)
- [API](docs/api/README.md)
- [Product](docs/product/README.md)
- [Onboarding](docs/onboarding/README.md)
- [Security baseline](docs/SECURITY_BASELINE.md)
- [Contributing](CONTRIBUTING.md)
