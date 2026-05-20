# Public trainer profile

**Status**: design approved (2026-05-20), implementation pending.

## Context

Today dexkepo's `/me` page is the only place a user can see their progress, achievements, and favorite Pokémon — and it's gated behind their own JWT. There's no way to share "look at my dex" with a friend without screenshotting. We want a **public, link-shareable trainer page** at `/trainer/{pseudo}` so users can show off their dex without exposing private data or requiring viewers to sign in.

This is a v1: read-only, no comments, no follows, no leaderboards. Just a stable URL that renders the trainer's pseudo, progress, achievements, and favorite Pokémon podium.

## Decisions

| Decision | Choice |
|---|---|
| URL shape | `/trainer/{pseudo}` (pseudo is already unique on User) |
| Privacy default | **Public by default**, opt-out toggle in `/me` |
| Sections shown | Hero (pseudo + progress + member-since) · Achievements grid · Favorite Pokémon podium (top 3) |
| Auth on view | None — anonymous browsers can load it |
| Private/missing response | Both return **404** (no info leak distinguishing "doesn't exist" from "private") |
| Rate limit | New `trainer-public` throttler tier: 60 req/min/IP (anonymous, so IP-keyed) |
| Frontend rendering | SvelteKit client-side route (existing `adapter-static` fallback `index.html`) |
| Backend module | New `trainers` module, hexagonal split (`trainers.service.ts` + `trainers.db.ts`), composes existing Dex / Manholes / Achievements / Favorites services |

## Section 1 — Schema + privacy toggle

### Prisma

Add one field to `User`:

```prisma
model User {
  // …existing fields…
  publicProfile Boolean @default(true)
}
```

Migration name: `add-user-public-profile`. Existing rows backfill to `true` via the default, which matches the "public by default" decision.

### `PATCH /users/me`

Extend the existing UsersController with a partial update endpoint:

- **Body**: `{ publicProfile?: boolean }` (validated with `class-validator`; `IsBoolean` + `IsOptional`).
- **Auth**: JwtAuthGuard (existing).
- **Returns**: the updated `UserPublic` shape (same as `/users/me` GET).
- **DB layer**: `UsersDb.updateProfile(id, patch)` — only file in the module that touches Prisma.

The service throws `NotFoundException` if Prisma returns null (shouldn't happen with a valid JWT, but defensive).

### Shared types

`shared/src/auth.ts` `UserPublic` gains `publicProfile: boolean`. Existing clients ignore unknown fields, so this is non-breaking.

## Section 2 — API: `GET /trainers/:pseudo`

### Module structure

New module `api/src/trainers/` following hexagonal split:

```
trainers/
  trainers.module.ts        # imports DexModule, ManholesModule, AchievementsModule, FavoritesModule, UsersModule
  trainers.controller.ts    # GET /trainers/:pseudo
  trainers.service.ts       # composes the other services; no Prisma import
  trainers.db.ts            # only file importing Prisma: findByPseudo(pseudo)
```

`trainers.db.ts` exposes one method:

```ts
@Injectable()
export class TrainersDb {
  constructor(private prisma: PrismaService) {}

  findByPseudo(pseudo: string): Promise<{ id: string; pseudo: string; createdAt: Date; publicProfile: boolean } | null> {
    return this.prisma.user.findUnique({
      where: { pseudo },
      select: { id: true, pseudo: true, createdAt: true, publicProfile: true },
    });
  }
}
```

`trainers.service.ts` orchestrates:

1. `db.findByPseudo(pseudo)` → if `null` OR `publicProfile === false` → throw `NotFoundException` (same 404 either way).
2. In parallel (`Promise.all`):
   - `DexService.listForUser(userId)` → visited count
   - `ManholesService.count()` → total covers
   - `AchievementsService.publicListForUser(userId)` → unlocked-only achievements (new method; mirrors existing list but filters to `unlocked: true` and drops any private fields)
   - `FavoritesService.forUser(userId)` → top-3 by ratio (existing behaviour)
3. Returns `TrainerProfile` shape.

### Endpoint

```ts
@Controller('trainers')
@UseGuards(TrainerPublicThrottlerGuard)
@SkipThrottle({ 'dex-burst': true, 'dex-sustained': true })
export class TrainersController {
  constructor(private trainers: TrainersService) {}

  @Get(':pseudo')
  one(@Param('pseudo') pseudo: string): Promise<TrainerProfile> {
    return this.trainers.profile(pseudo);
  }
}
```

The `trainer-public` tier's limits live solely in `ThrottlerModule.forRoot([...])` — no per-route `@Throttle` override needed. `@SkipThrottle` opts out of the dex tiers, which would otherwise also apply to this controller because all registered tiers are global by default.

Symmetrically, the existing `DexController` needs `@SkipThrottle({ 'trainer-public': true })` added so its requests don't count against the public-profile bucket.

### Throttler tier

Add a third named tier in `app.module.ts`:

```ts
ThrottlerModule.forRoot([
  { name: 'dex-burst',      ttl:        60_000, limit: 10 },
  { name: 'dex-sustained',  ttl: 60 * 60_000,   limit: 60 },
  { name: 'trainer-public', ttl:        60_000, limit: 60 },
]);
```

A new `TrainerPublicThrottlerGuard` extends `ThrottlerGuard` and overrides `getTracker` to always return `req.ip ?? 'unknown'` (no JWT path — this endpoint is anonymous). Distinct from `UserThrottlerGuard` because that one expects `req.user` to be populated.

### Response shape (`shared/src/trainer.ts`)

```ts
export interface TrainerProfile {
  pseudo: string;
  memberSince: string;        // ISO date
  visitedCount: number;
  totalCount: number;
  achievements: PublicAchievement[];
  favorites: FavoritePokemon[]; // existing shape, top-3
}

export interface PublicAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlockedAt: string;
}
```

No emails, no JWT, no DexEntry rows — only aggregated counts and unlocked badges.

## Section 3 — Frontend route + components

### Route: `web/src/routes/trainer/[pseudo]/+page.svelte`

Client-rendered (existing `adapter-static` + `index.html` fallback already handles dynamic params). On mount:

```ts
const profileQ = createQuery({
  queryKey: ['trainer', pseudo],
  queryFn: () => getTrainer(pseudo),
  retry: false, // 404 should not retry
});
```

`web/src/lib/api/trainers.ts` → `getTrainer(pseudo): Promise<TrainerProfile>`. On 404 the fetch wrapper throws; the page renders `<TrainerNotFound />`.

### New components (`web/src/lib/components/trainer/`)

- **`TrainerHero.svelte`** — Same rose→red→orange gradient as `/me` hero. Shows pseudo, "Trainer since {memberSince}", progress fraction + percentage + progress bar. No email shown.
- **`TrainerNotFound.svelte`** — Centered card: "🕵️ This trainer is hiding their dex" + link back to `/`. Same message for genuine 404 (no info leak).
- **`PublicProfileCard.svelte`** — Added to `/me`. Toggle for `publicProfile` (wired to `PATCH /users/me`) + "Copy public link" button that copies `${location.origin}/trainer/${pseudo}` to clipboard. When toggle is off, the copy button is disabled with a tooltip explaining the link won't work until they re-enable it.

### Reused components

`AchievementBadge.svelte` and `FavoritePokemon.svelte` already render the data shapes we need — they get passed `PublicAchievement[]` and `FavoritePokemon[]` respectively. No edits to those files.

### Header link

When `$auth` is truthy, `Header.svelte` gains a "View public profile" link next to the existing `/me` link, pointing at `/trainer/{$auth.user.pseudo}`. Hidden when `$auth` is null (you have to be logged in to know your own pseudo for this UI affordance).

## Section 4 — Files + verification

### New files

```
api/src/trainers/
  trainers.module.ts
  trainers.controller.ts
  trainers.service.ts
  trainers.db.ts
api/src/common/
  trainer-public-throttler.guard.ts
api/prisma/migrations/<timestamp>_add-user-public-profile/migration.sql

shared/src/trainer.ts

web/src/routes/trainer/[pseudo]/+page.svelte
web/src/lib/api/trainers.ts
web/src/lib/components/trainer/
  TrainerHero.svelte
  TrainerNotFound.svelte
web/src/lib/components/me/
  PublicProfileCard.svelte
```

### Modified files

```
api/prisma/schema.prisma                       # + publicProfile field on User
api/src/app.module.ts                          # + TrainersModule, + 'trainer-public' tier
api/src/users/users.controller.ts              # + PATCH /users/me
api/src/users/users.service.ts                 # + updateProfile()
api/src/users/users.db.ts                      # + updateProfile()
api/src/achievements/achievements.service.ts   # + publicListForUser() (additive)
shared/src/auth.ts                             # + publicProfile on UserPublic
shared/src/index.ts                            # + export './trainer'

web/src/lib/api/auth.ts                        # + updateProfile() helper
web/src/lib/stores/auth.ts                     # propagate publicProfile updates back into the store
web/src/lib/components/Header.svelte           # + "Public profile" link when authed
web/src/routes/me/+page.svelte                 # render <PublicProfileCard />
```

### Untouched (consumed but not edited)

- `AchievementBadge.svelte`, `FavoritePokemon.svelte`
- Existing DexService / ManholesService / FavoritesService (already return what we need)
- AchievementsService gets one **additive** method `publicListForUser` — non-destructive

### Verification

1. **Migration**: `npm --workspace api run prisma:migrate-dev -- --name add-user-public-profile` succeeds. New column on existing rows is `true`.
2. **Public happy path**: `GET /trainers/<existing-pseudo>` → 200 with the documented shape. No `email`, no JWT, no per-cover visit data.
3. **Private**: `PATCH /users/me` with `{ publicProfile: false }` → 200; subsequent `GET /trainers/<that-pseudo>` → 404.
4. **Re-enable**: toggle back on → 200 again.
5. **404 indistinguishability**: `GET /trainers/nonexistent` and `GET /trainers/<private>` both return the same 404 body.
6. **Rate limit**: 61 requests in 60s from one IP → request 61 returns 429 with `Retry-After`. A different IP still works.
7. **Frontend anonymous**: log out, visit `/trainer/<pseudo>` → page renders fully without any auth UI prompting.
8. **Frontend private**: visit `/trainer/<private-pseudo>` → `<TrainerNotFound />` renders, no console errors.
9. **Toggle UX**: on `/me`, flipping the toggle updates the `auth` store and disables the "Copy link" button without a page reload.
10. **Build**: `npm --workspace api run build`, `npm --workspace web run check`, `npm --workspace web run build` all clean.

### Privacy invariants (must hold)

- Private profile and missing profile are **indistinguishable** to anonymous viewers.
- The public response **never** contains: email, password hash, JWT, raw DexEntry rows, IP, createdAt time-of-day precision beyond date.
- The trainer endpoint **never** mutates anything.
- Rate-limit tracker for `/trainers/:pseudo` is IP-keyed; no user identifier touches that path.

## Out of scope

- Open Graph image / Twitter card preview (defer; needs a renderer).
- Follower / friends graph, comments, reactions.
- Public leaderboards or rankings.
- Slugged URLs different from pseudo (e.g. `/u/{id}` redirect).
- Trainer search / directory listing.
- Anti-enumeration via timing equalisation (private vs missing) — same status code is enough for v1.
- Showing a "private" badge to the trainer themselves on their own public page (we just give them the toggle in /me).
