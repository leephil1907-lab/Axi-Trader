# Deploy Checklist — Axi Trader on Deno Deploy

Deno Deploy supports Next.js (including SSR) via its `nextjs` framework preset
([builds docs](https://docs.deno.com/deploy/reference/builds/),
[Next.js SSR announcement](https://denoland.medium.com/run-your-next-js-ssr-app-on-deno-deploy-a89cfd827eea),
[template repo](https://github.com/lambtron/nextjs-deno-deploy)).
This repo is already prepared: `output: "standalone"` in `next.config.js` and a
`deno.json` with the `nextjs` framework config. Work through the steps in order.

> Local preview runs on SQLite. Deno's filesystem is ephemeral — **production
> MUST use hosted PostgreSQL**. SQLite will lose all data on redeploy.

## A. Pre-deploy code steps (do once, locally)

- [ ] **Restore the PostgreSQL schema**
  ```bash
  cp prisma/schema.prisma.postgres.bak prisma/schema.prisma
  ```
  The `.bak` is the original Postgres schema (`Json` metadata column). All app
  code auto-adapts to the provider from `DATABASE_URL`:
  `src/lib/audit.ts` (Json passthrough vs stringified) and
  `src/lib/complete-transaction.ts` (`FOR UPDATE` only on Postgres).
- [ ] **Restore strict browser headers for production**
  ```bash
  cp next.config.js.bak next.config.js
  ```
  then re-add one line the preview needed:
  ```js
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  ```
  (Keep the preview-relaxed `next.config.js` only for local iframe testing.)
- [ ] **Verify a clean production-style build**
  ```bash
  npm install
  npx prisma generate
  npm run build   # expect: "Compiled successfully", 43 routes incl. /verify
  ```
- [ ] **Commit & push to GitHub** (`main` branch). Confirm `.env` is NOT
  committed (`.gitignore` already excludes `.env`, `*.db`, `.next/`).
  The `prisma/schema.prisma.postgres.bak` and `next.config.js.bak` files are
  intentionally committed as restore sources.

## B. Provision managed services (before first deploy)

- [ ] **PostgreSQL** — Neon, Supabase, Railway, or Prisma Postgres. Copy the
  **pooled** connection string:
  `postgresql://user:password@host:5432/axi_trader?schema=public`
- [ ] **Resend** — API key + verified sending domain; note the
  `noreply@your-domain` address.
- [ ] **Stripe** (only if taking card deposits) — live secret key, publishable
  key, webhook secret. After deploy, add webhook endpoint
  `https://<your-app>.deno.dev/api/payments/stripe/webhook/` in the Stripe dashboard.
- [ ] **Groq** (optional) — `GROQ_API_KEY` for the chat assistant. Without it the
  widget shows an honest "unavailable" fallback; nothing breaks.
- [ ] **Market data** (optional) — built-in Yahoo Finance aggregation works with
  zero config (30 instruments, 30s cache). For a licensed production feed, set
  `MARKET_DATA_URL` to your provider endpoint and the app switches to it
  automatically. `MARKET_SYMBOLS` (e.g. `EURUSD,XAUUSD,BTCUSD`) can trim the universe.
- [ ] **JWT secret** — generate 32+ random characters:
  `openssl rand -base64 48`. Auth **fails closed** if missing/short.

## C. Create the Deno Deploy project

- [ ] Go to [dash.deno.com](https://dash.deno.com/) → **New Project** → select the GitHub repo.
- [ ] Framework preset: **`nextjs`** (auto-detected). Confirm:
  - Install command: `npm install`
  - Build command: `npx prisma generate && npx prisma db push && npm run build`
    (`deno.json` already declares these; dashboard may pick them up automatically.)
- [ ] Set **environment variables** in Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | pooled Postgres URL from step B |
| `JWT_SECRET` | 32+ char secret |
| `JWT_EXPIRES_IN` | `7d` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.deno.dev` (must match exactly — middleware CORS compares origins) |
| `API_URL` | `https://<your-app>.deno.dev/api` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | from step B |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PUBLISHABLE_KEY` | from step B (or leave empty to disable cards) |
| `GROQ_API_KEY` | optional |
| `MARKET_DATA_URL` / `MARKET_SYMBOLS` | optional |
| `BROKER_EXECUTION_URL` (+ key/secret), `KYC_PROVIDER` (+ keys) | **leave empty** until real integrations exist — trading/copy-trading stay honestly disabled |

- [ ] **Deploy.** Watch the build logs: Prisma generate → db push → Next build → live URL.

## D. First-run production setup (on the live URL)

- [ ] `GET /api/health/` → `{"status":"ok","database":"ok"}`.
- [ ] Register the owner account at `/register/` (5-step wizard), then promote it
  to admin directly in the database (there is deliberately no self-promote endpoint):
  ```sql
  UPDATE "User" SET role = 'admin' WHERE email = 'you@your-domain.com';
  ```
  Sign out and back in so the new role is in the token.
- [ ] As admin: `/admin/funding/` → create + **enable** funding methods
  (bank/crypto/card); `/admin/` → verify transaction review, KYC review, promotions.
- [ ] As a test user: register → `/verify/` upload → admin approves → deposit →
  admin completes → balance updates → withdraw → admin reviews.
- [ ] Delete the test user + test rows afterwards (admin has no delete-user UI by
  design — use the database client).

## E. Smoke tests (copy/paste against the live URL)

```bash
BASE=https://<your-app>.deno.dev
curl -s $BASE/api/health/                                   # status ok
curl -s $BASE/api/markets/ | head -c 200                    # live:true, real quotes
curl -s -o /dev/null -w "%{http_code}\n" $BASE/             # 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/dashboard/   # 307 → /login/ (protected ✓)
curl -s -X POST $BASE/api/auth/register/ \
  -H 'Content-Type: application/json' -d '{"email":"x@y.com"}'  # 400 Missing required fields
```

## F. Known risks & mitigations

- [ ] **Prisma native engine on Deno isolates (biggest risk).** Prisma 5 loads a
  native query-engine binary; Deno's isolate runtime may refuse it. If deploy
  logs show engine-load errors (`prisma.$queryRaw` P2010/engine panics at
  runtime), switch `DATABASE_URL` to **Prisma Accelerate**
  (`prisma+postgres://…`, HTTP-based, no binary) and add the accelerate
  extension — or deploy the included `Dockerfile` to Railway/Render/Fly instead
  (already configured via `railway.toml` + `vercel.json` as alternatives).
- [ ] **Yahoo Finance is unofficial.** Fine for launch, but a licensed provider
  via `MARKET_DATA_URL` is recommended long-term; the switch is env-only.
- [ ] **KYC files are stored in the database as data URLs (≤5 MB).** Works
  everywhere with zero infra; move to object storage (S3/R2) when volume grows.
- [ ] **No local disk writes.** The app never writes uploads/logs to disk —
  safe on ephemeral runtimes.
- [ ] **Rollback:** Deno keeps previous deployments — one click in the dashboard;
  or `git revert` + push to redeploy.
- [ ] **Custom domain:** Project → Settings → Domains, then update
  `NEXT_PUBLIC_APP_URL`/`API_URL` and the Stripe webhook URL to match.
