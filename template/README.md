# __PROJECT_NAME__

Full-stack monorepo powered by **Nuxt** (frontend) and **NestJS** (API), with shared TypeScript types, JWT auth, and Postgres.

Scaffolded with [create-nust](https://github.com/VladLavysh/create-nust).

## Stack

| Layer | Tech | Location |
|-------|------|----------|
| Frontend | Nuxt 4, Vue 3 | `apps/web` |
| Backend | NestJS 10, TypeORM | `apps/api` |
| Shared | TypeScript DTOs & types | `packages/shared` |
| Database | PostgreSQL 16 | Docker |

## Requirements

- Node.js 18+
- pnpm
- Docker (for Postgres, or full stack in Docker mode)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment

A `.env` file is created from `.env.example` when you scaffold the project. Review it and **change JWT secrets** before deploying.

### 3. Start the database

```bash
pnpm docker:db
```

Keeps Postgres running in Docker while you develop locally (hybrid setup).

### 4. Run the apps

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web (Nuxt) | http://localhost:3000 |
| API (Nest) | http://localhost:3001 |

## Project structure

```
__PROJECT_NAME__/
├── apps/
│   ├── api/                 # NestJS REST API
│   │   └── src/
│   │       ├── auth/        # JWT login, register, guards
│   │       └── users/
│   └── web/                 # Nuxt frontend
│       └── app/
│           ├── components/  # UI + auth forms
│           ├── composables/ # useAuth, useAuthTokens
│           ├── middleware/  # route protection
│           └── pages/       # routes (incl. /auth/*)
├── packages/
│   └── shared/              # shared DTOs, enums, types
├── postman/                 # API collection (if included at scaffold)
├── .env                     # local secrets (not committed)
├── .env.example             # reference for required variables
└── docker-compose.yml       # Postgres (hybrid) or full stack
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run web and API in parallel with hot reload |
| `pnpm build` | Build all workspace packages |
| `pnpm docker:db` | Start Postgres container |
| `pnpm docker:down` | Stop Docker services |

## Environment variables

See `.env.example` for the full list. Common values:

| Variable | Purpose |
|----------|---------|
| `API_URL` | Base URL the Nuxt app uses to call the API |
| `WEB_URL` | Allowed CORS origin for the API |
| `DB_*` | PostgreSQL connection settings |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing — use strong values in production |

## Auth

- **API:** `POST /auth/register`, `POST /auth/login`, JWT access + refresh tokens  
- **Web:** Login / register pages, cookie-based tokens, global auth middleware  

Shared request/response shapes live in `packages/shared`.

## API testing

If you included the Postman collection at scaffold time, import:

```
postman/nust.postman_collection.json
```

Set the collection variable for the API base URL to `http://localhost:3001` (or your `API_URL`).

## Full Docker (optional)

If this project was scaffolded in **full Docker** mode, start everything with:

```bash
docker compose up --build
```

Hybrid mode (Postgres in Docker, apps on host) is the recommended day-to-day workflow.

## Learn more

- [Nuxt documentation](https://nuxt.com/docs)
- [NestJS documentation](https://docs.nestjs.com)
- [create-nust](https://github.com/VladLavysh/create-nust) — scaffold CLI
