# Nust monorepo template

Full-stack **Nuxt + NestJS** monorepo scaffolded by [create-nust](https://github.com/VladLavysh/create-nust).

## Authentication options

When you run `create-nust`, you choose how auth is set up:

| Option | Description |
|--------|-------------|
| **JWT** | Access + refresh tokens returned from the API; Nuxt stores them in cookies and sends `Authorization: Bearer`. |
| **Sessions** | Server-side sessions in **Redis** with an httpOnly cookie. Nuxt proxies `/api/v1` so cookies stay same-origin in dev. |
| **No auth** | Auth modules, pages, and guards are omitted. |

### OAuth (optional)

When you choose **JWT** or **Sessions**, you can enable **Google** and/or **GitHub** sign-in. The CLI copies provider strategies, login buttons, and `.env` fragments into your project.

1. Create OAuth apps in the [Google Cloud Console](https://console.cloud.google.com/) and/or [GitHub Developer Settings](https://github.com/settings/developers).
2. Set callback URLs to match your API (default hybrid dev):
   - Google: `http://localhost:3001/api/v1/auth/google/callback`
   - GitHub: `http://localhost:3001/api/v1/auth/github/callback`
3. Fill in `.env` (`GOOGLE_*`, `GITHUB_*`).
4. **JWT**: after OAuth, the API redirects to `/auth/oauth-callback` with tokens in the query string (dev-only; use a code exchange in production).
5. **Sessions**: after OAuth, the API sets the session cookie and redirects to `WEB_URL`.

OAuth-only users have no password; email/password login is rejected for those accounts.

## Development (hybrid mode)

```bash
pnpm install
pnpm docker:db    # JWT / No auth: Postgres | Sessions: Postgres + Redis
pnpm dev          # Nuxt :3000 + Nest :3001
```

### JWT

- Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `.env` before production.
- API base URL: `API_URL` (default `http://localhost:3001`).

### Sessions

- `pnpm docker:db` starts **Postgres and Redis** in Docker.
- Set `SESSION_SECRET` in `.env`.
- The web app calls the API through a **Nuxt proxy** (`/api/v1` → Nest) so session cookies work on `localhost` without cross-origin issues.
- Postman: enable the **cookie jar** for `localhost:3001` when testing session endpoints directly.

### No auth

- `pnpm docker:db` starts **Postgres** in Docker (the API still uses the database).
- Use the generated app as a starting point without login/register flows.

## Docker

- **Hybrid** (default): Postgres (+ Redis for sessions) in Docker; apps on the host.
- **Full**: All services in containers (experimental).

## Postman

If included, import `postman/nust.postman_collection.json` (JWT or session variant depending on your choice).
