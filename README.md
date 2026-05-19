# dexkepo

A community map + personal "manholedex" for the 470 Pokémon manhole covers ([poké-fúta](https://local.pokemon.co.jp/en/manhole/)) scattered across Japan. Browse the covers on an OpenStreetMap, sign up, and mark each one you've visited.

Live: **https://dexkepo.pages.dev**

Source for the manhole catalogue: the sibling [pokemap](https://github.com/Sufiane/pokemap) project, which scraped all 470 covers into a JSON file.

---

## Stack

| Layer | Choice |
|---|---|
| API | **NestJS** + **Prisma** + JWT auth + `class-validator` |
| Database | **Neon Postgres** (serverless, free tier) |
| Frontend | **SvelteKit** (TypeScript, `adapter-static` SPA) |
| Map | **Leaflet** + OpenStreetMap raster tiles + `leaflet.markercluster` |
| Styling | **Tailwind CSS** |
| Data fetching | **`@tanstack/svelte-query`** |
| API host | **Back4App Containers** (free tier, no card) |
| Frontend host | **Cloudflare Pages** |
| Shared types | npm workspace `@dexkepo/shared` |

---

## Repo layout (monorepo, npm workspaces)

```
dexkepo/
├── package.json            # root workspaces config + dev scripts
├── Dockerfile              # builds the API container (used by Back4App)
├── .dockerignore
├── shared/                 # @dexkepo/shared — TS types used by both api and web
│   └── src/
│       ├── manhole.ts      # Manhole, ManholeSummary, PokemonRef
│       ├── auth.ts         # RegisterRequest, LoginRequest, AuthResponse
│       ├── dex.ts          # DexEntry, DexEntryWithManhole
│       └── index.ts
├── api/                    # @dexkepo/api — NestJS server
│   ├── prisma/
│   │   ├── schema.prisma   # User, Manhole, DexEntry
│   │   ├── seed.ts         # seeds 470 manholes from data/manholes.json
│   │   └── migrations/
│   ├── data/manholes.json  # snapshot from pokemap project
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── auth/           # POST /auth/register, POST /auth/login
│       ├── users/          # GET /users/me
│       ├── manholes/       # GET /manholes (slim), GET /manholes/:no (full)
│       ├── dex/            # GET/POST/DELETE /me/dex[/:no]
│       ├── health/         # GET /health
│       ├── prisma/         # PrismaService + global module
│       └── common/         # JwtAuthGuard, @CurrentUser decorator
└── web/                    # @dexkepo/web — SvelteKit SPA
    ├── svelte.config.js    # adapter-static, fallback index.html
    ├── tailwind.config.ts
    ├── static/
    │   └── _redirects      # CF Pages SPA fallback: /* /index.html 200
    └── src/
        ├── app.html
        ├── app.css         # Tailwind + Leaflet overrides
        ├── routes/
        │   ├── +layout.svelte   # Header + svelte-query provider; imports Leaflet CSS
        │   ├── +page.svelte     # map page
        │   ├── login/+page.svelte
        │   ├── register/+page.svelte
        │   └── me/+page.svelte  # profile + visited list
        └── lib/
            ├── api/             # fetch wrapper, manholes/auth/dex clients
            ├── stores/          # auth + filters (Svelte stores)
            ├── map/             # Map.svelte + marker icon factories
            └── components/      # Header, FilterBar, ManholePanel
```

---

## API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/health` | — | no DB touch, used for uptime checks |
| `POST` | `/auth/register` | — | `{pseudo, email, password}` → `{accessToken, user}` |
| `POST` | `/auth/login` | — | `{email, password}` → `{accessToken, user}` |
| `GET` | `/users/me` | JWT | current user |
| `GET` | `/manholes` | — | slim list (470 rows, ~43kB) — only `manholeNo, name, prefEnName, lat, lng` |
| `GET` | `/manholes/:manholeNo` | — | full Manhole including pokemon + picture |
| `GET` | `/me/dex` | JWT | user's visited manholes (joined) |
| `POST` | `/me/dex/:manholeNo` | JWT | mark visited (idempotent upsert) |
| `DELETE` | `/me/dex/:manholeNo` | JWT | unmark |

The split between slim list + detailed single is intentional: keeps the 470-row response small enough to be reliable on tight-RAM hosts.

---

## Local development

### Prerequisites

- Node.js 24+ (Node 20 EoL'd April 2026)
- A Neon Postgres database (free at [neon.tech](https://neon.tech))

### One-time setup

```bash
git clone git@github.com:Sufiane/dexkepo.git
cd dexkepo
npm install                                  # installs all workspaces (api + web + shared)
```

Create `api/.env`:

```
DATABASE_URL="postgresql://USER:PASS@HOST/db?sslmode=require"
JWT_SECRET="some-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=7777
```

Create `web/.env`:

```
VITE_API_BASE_URL=http://localhost:7777
```

Initialize the database:

```bash
npm --workspace api exec -- prisma migrate dev --name init
npm --workspace api run prisma:seed          # inserts 470 manholes
```

### Run

In one terminal:

```bash
npm run dev:api      # NestJS on :7777
```

In another:

```bash
npm run dev:web      # SvelteKit on :5173
```

Open http://localhost:5173.

### Useful scripts

| Command | What |
|---|---|
| `npm run dev:api` | nest start --watch |
| `npm run dev:web` | vite dev |
| `npm run build:api` | nest build |
| `npm run build:web` | vite build → `web/build/` |
| `npm run typecheck` | typecheck shared + api + web |
| `npm --workspace api run prisma:seed` | re-seed the manhole catalogue |

---

## Deployment

### API → Back4App Containers

The repo has a root [`Dockerfile`](Dockerfile) — multi-stage Node 24 build that bundles the `shared` workspace alongside the API.

1. Sign in at [back4app.com](https://www.back4app.com)
2. New App → **Containers as a Service** → connect this repo
3. Build settings:
   - Branch: `main`
   - **Root Directory**: `./`
   - **Port**: `8080`
4. Environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — long random string
   - `JWT_EXPIRES_IN` — `7d`
   - `NODE_ENV` — `production`
5. Deploy.

On boot the container runs `npx prisma migrate deploy` then `node dist/main.js`.

**Free-tier caveat**: the public URL changes every hour. Each rotation requires updating `VITE_API_BASE_URL` on Cloudflare Pages **and** retrying the deployment (see below) so the new URL is baked into the JS bundle. This is the main reason to upgrade off the free tier eventually.

### Frontend → Cloudflare Pages

1. CF Pages → Connect to Git → pick `Sufiane/dexkepo`
2. Build settings:
   - Production branch: `main`
   - Framework preset: `SvelteKit`
   - Build command: `npm install && npm run build:web`
   - Build output directory: `web/build`
   - Root directory: *(blank — needs repo root so workspaces resolve)*
3. Environment variables (Production):
   - `VITE_API_BASE_URL` — full URL **with `https://`** (e.g. `https://dexkepo-2bfmm50i.b4a.run`)
   - `NODE_VERSION` — `24`
4. Deploy.

### When the Back4App URL rotates

1. Get the new URL from the Back4App dashboard
2. CF Pages → Settings → Environment Variables → edit `VITE_API_BASE_URL`
3. **Deployments tab → latest → Retry deployment** (Vite inlines env vars at build time; updating the value alone does nothing)

---

## Architecture notes / gotchas

A few things worth knowing before touching the code:

- **Bundle Leaflet CSS via JS import**, not `@import` in CSS. The PostCSS `@import` resolution from `node_modules` is flaky in some build environments (notably Cloudflare Pages) and can silently drop the bundle. See [+layout.svelte](web/src/routes/+layout.svelte).
- **Tailwind's preflight resets `img { max-width: 100%; height: auto }`** which clashes with Leaflet tiles. The override lives in [app.css](web/src/app.css). Don't remove it.
- **SPA routing on CF Pages** needs [`web/static/_redirects`](web/static/_redirects) — `/* /index.html 200` — so deep links like `/login` don't 404.
- **Map sizing**: Leaflet has to be told to recompute size after flex parents settle. `Map.svelte` calls `invalidateSize()` after the first paint and again on every parent resize via `ResizeObserver`. Don't skip this if you refactor the page layout.
- **Manhole PK is `manhole_no`** (string, from the source JSON). Not a UUID, not an int. Keeps joins simple.
- **`/manholes` returns a slim summary** (5 fields per row, ~43kB total). Full detail comes from `/manholes/:no` and is loaded only when the user opens a marker popup. Don't fatten the list endpoint — it'll OOM low-RAM hosts.
- **JWT is stored in `localStorage`** — fine for hobby, XSS-vulnerable. Switch to httpOnly cookies if this ever sees real users.

---

## Roadmap

- **Phase 3** — photo upload as visit proof. Add `photoUrl` to `DexEntry`, use Cloudflare R2 / Supabase Storage for files.
- **Tighten CORS** from `*` to the CF Pages origin.
- **Refresh tokens, password reset, email verification.**
- **Filter improvements**: Pokémon name search across all 470 covers.
- **Custom domain** on Cloudflare Pages.
- **i18n** — Japanese UI.
- **Migrate to MapLibre vector tiles** if the raster look feels dated.

---

## License

Personal hobby project. Manhole imagery copyright The Pokémon Company; data scraped from their public catalogue is used here for non-commercial fan use.
