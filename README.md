# create-nust

**create-nust** is a CLI that scaffolds a production-ready **Nuxt + NestJS** monorepo with JWT auth, shared types, Docker, and sensible defaults — so you can skip the boilerplate and start building.

Published on npm as [`create-nust`](https://www.npmjs.com/package/create-nust).

## Features

- **Monorepo** — pnpm workspaces with `apps/api`, `apps/web`, and `packages/shared`
- **Nuxt 4** frontend with Vue 3, composables, and global auth middleware
- **NestJS 10** backend with TypeORM, Postgres, and JWT auth (register / login / refresh)
- **Shared package** — DTOs, enums, and types used by both apps
- **Docker** — hybrid mode (Postgres in Docker, apps on host) or full Docker (experimental)
- **Environment** — `.env` created automatically from `.env.example`
- **Optional Postman collection** for API testing
- **Interactive CLI** — guided prompts with a project summary when finished

## Requirements

- **Node.js** 18+
- **pnpm** (used to install dependencies in new projects; falls back to npm if pnpm is missing)
- **Docker** — required for the database in hybrid mode, or for the full stack in full Docker mode

## Quick start

Create a project (recommended):

```bash
npm create nust@latest
```

Or run directly with npx:

```bash
npx create-nust my-app
cd my-app
```

You can also pass the project name up front:

```bash
npx create-nust my-nust-app
```

### Hybrid mode (recommended)

Postgres runs in Docker; Nuxt and Nest run locally with hot reload.

```bash
pnpm docker:db    # start Postgres
pnpm dev          # start web (:3000) + api (:3001)
```

- Web: http://localhost:3000  
- API: http://localhost:3001  

### Full Docker mode (experimental)

All services run in containers. After scaffolding, start the stack with:

```bash
docker compose up --build
```

> **Note:** Full Docker mode is still experimental and may require extra configuration.

## CLI prompts

| Prompt | Description |
|--------|-------------|
| **Project name** | Lowercase letters, numbers, hyphens, underscores only |
| **Development mode** | `Hybrid` (recommended) or `Full Docker` |
| **Postman collection** | Include `postman/nust.postman_collection.json` or skip |
| **Install dependencies** | Run `pnpm install` in the new project (falls back to npm) |

The CLI will:

1. Copy the template and apply your project name  
2. Set up `docker-compose.yml` for the chosen mode  
3. Create `.env` from `.env.example`  
4. Show a **summary** with URLs, stack details, and next commands  

## Generated project structure

```
my-app/
├── apps/
│   ├── api/          # NestJS — REST API, auth, TypeORM
│   └── web/          # Nuxt — frontend, pages, composables
├── packages/
│   └── shared/       # Shared DTOs, types, enums
├── postman/          # optional — API collection
├── .env              # created for you (gitignored)
├── .env.example      # committed reference
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## What's included in the template

### Frontend (`apps/web`)

- Nuxt 4 with TypeScript  
- Auth pages (login / register) and protected routes  
- `useAuth` / `useAuthTokens` composables  
- API plugin wired to `API_URL` from `.env`  

### Backend (`apps/api`)

- NestJS with TypeORM and Postgres  
- JWT access + refresh token flow  
- User module and auth guards  
- CORS configured for the Nuxt dev server  

### Shared (`packages/shared`)

- Auth DTOs and user types imported by both apps  

### Environment variables

Key variables in `.env` (see `.env.example` for the full list):

| Variable | Default | Purpose |
|----------|---------|---------|
| `API_PORT` | `3001` | Nest server port |
| `API_URL` | `http://localhost:3001` | API base URL for the web app |
| `WEB_URL` | `http://localhost:3000` | Allowed CORS origin |
| `DB_*` | postgres / `nust_db` | Postgres connection |
| `JWT_*` | placeholders | Secrets and token expiry — **change before production** |

## Scripts in a generated project

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run web + api in parallel |
| `pnpm build` | Build all workspace packages |
| `pnpm docker:db` | Start Postgres only (hybrid mode) |
| `pnpm docker:down` | Stop Docker services |

## Developing this CLI locally

Clone the repo and install dependencies:

```bash
git clone https://github.com/VladLavysh/create-nust.git
cd create-nust
pnpm install
pnpm build
```

Run the CLI from the repo (uses `dist/` + root `template/`):

```bash
node dist/index.js my-test-app
# or from another directory:
node path/to/create-nust/dist/index.js my-test-app
```

Watch mode while editing TypeScript:

```bash
pnpm dev
```

### Project layout (this repo)

```
create-nust/
├── src/           # CLI source (TypeScript)
├── dist/          # Compiled output (published to npm)
├── template/      # Scaffold copied into new projects (published to npm)
└── package.json
```

The template lives **next to** `dist/`, not inside it. At runtime the CLI resolves `../template` from `dist/scaffold.js`. Both folders are included in the npm package via the `"files"` field.

### Publishing to npm

```bash
pnpm build
npm login          # as the package maintainer
npm pack --dry-run # verify dist/ and template/ are included
npm publish
```

## License

ISC © [Vlad Lavysh](https://github.com/VladLavysh)
