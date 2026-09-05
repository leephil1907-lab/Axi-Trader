# Axi Trader — Import & Build Notes (Arena Preview)

Repo imported from https://github.com/leephil1907-lab/Axi-Trader into `/home/user/axi-trader` on 2026-09-05.

## Live preview
The site is built and running:
- `npm install` ✅
- `npm run build` ✅ (42 routes)
- `npm start -- --port 3000 --hostname 0.0.0.0` ✅
- Health: `GET /api/health/` → `{"status":"ok","database":"ok"}`
- Tested: homepage `200`, register `POST /api/auth/register/` works (created demo@axitrades.com)

Open the **Axi Trader Website** live preview to browse: Home, Markets, Trading, Copy Trading, Login/Register, Dashboard (after login), Deposit/Withdraw/Wallet, Admin.

Database holds only the owner admin account (`admin@axitrades.com`, role `admin`) — all demo/test users, transactions and audit residue were wiped on 2026-09-05 — all demo/test accounts, audit and rate-limit residue were wiped on 2026-09-05. Register a fresh account from `/register/` to try the app.

## What was changed to run locally
Production repo targets **PostgreSQL + Railway/Vercel**. The sandbox has no Postgres, so for local preview only:

1. `prisma/schema.prisma`
   - `provider postgresql` → `sqlite` (local file `prisma/dev.db`)
   - `AuditLog.metadata Json?` → `String?` (SQLite has no Json type; audit helper stringifies)
   - Original backed up at `prisma/schema.prisma.postgres.bak`
2. `.env` created (SQLite URL + 32+ char JWT secret + placeholder Resend/Stripe keys)
3. `next.config.js`
   - Removed `X-Frame-Options: DENY` + `frame-ancestors 'none'` CSP so the Arena iframe preview can embed the site
   - Added `eslint.ignoreDuringBuilds` (eslint not installed in repo)
   - Original backed up at `next.config.js.bak`
4. Bug fixes found by `npm run build` (these are safe to keep in production too):
   - `src/lib/prisma.ts`: `import { PrismaClient } from "@prisma/client/runtime/library"` → `"@prisma/client"`
   - `src/lib/email.ts`: widened `firstName: string` → `string | null | undefined`
   - `src/middleware.ts`: cast WebCrypto buffers to `BufferSource` for TS 5.5
   - `src/app/api/assistant/route.ts`: lazy Groq init + graceful fallback when `GROQ_API_KEY` missing (was crashing build)
   - `src/app/trading/page.tsx`: wrapped `useSearchParams()` in `<Suspense>` (required by Next.js prerender)

## Environment configured + admin dashboard built (2026-09-05)
- `.env` (gitignored, verified ignored by git): fresh 64-char `JWT_SECRET`,
  `RESEND_FROM_EMAIL` normalized, **live Stripe keys stored + verified** via
  read-only `GET /v1/balance` (valid, livemode true). No Resend key provided —
  emails stay gracefully disabled. Webhook secret + Groq key skipped (expected
  pre-deploy). App URL kept local for preview.
- Admin account `admin@axitrades.com` created (role=admin, KYC verified so the
  owner can test trading gates), one-time password issued to owner.
- Verified: admin login 200, all 5 admin APIs 200 with clean empty datasets,
  `/admin/` 200 with token (307 anonymous → login, correct).
- Resend key stored + proven working: server log shows Resend accepted the key
  (422 only because the test address used a blackholed example.com domain).
  Real emails send once recipients use real addresses on the verified domain.
- Admin dashboard v2 (2026-09-05): click any user → full profile (contact,
  account, balances, KYC docs with previews, transactions incl. withdrawal
  destinations, trades, promotions/bonuses, audit trail); manual balance
  adjust (signed amount + mandatory reason → ledger transaction + audit, blocks
  overdrafts/suspended/no-reason); suspend/reactivate (self-lockout blocked);
  transactions expand with method snapshots + reject-requires-reason; KYC doc
  image preview + reject-requires-reason + jump-to-user; funding tab with
  enablement counts + deep link to /admin/funding/ full CRUD (wallet
  addresses, bank details, limits, regions); new Activity tab (audit trail);
  new APIs: GET /api/admin/users/?id=, PATCH /api/admin/users/,
  POST /api/admin/users/adjust-balance/, GET /api/admin/audit/. All tested:
  detail (no password leak), adjust, overdraft 409, suspended 409,
  reactivate, audit feed.
Full end-to-end test on the standalone server (same mode Deno uses):
Register 200 → Login 200 → Portfolio 200 → KYC submit 201 → trade blocked
`403 KYC_REQUIRED` → admin KYC approve → `verified` → funding method created →
deposit `pending` → bad-method withdrawal `409` → admin complete 200 → balance
500 → withdrawal `pending`. All private pages 307→login when signed out.
Security tests 6/6. DB wiped to 0 rows afterwards.

Wiring fixes made:
- Login now honors `?redirect=` (middleware sets it; was previously ignored).
- New `/verify/` KYC page (status + document upload ≤5 MB + history); linked from
  Settings and Dashboard; `/verify` + `/accounts` + `/positions` + `/watchlist`
  added to middleware-protected routes.
- Settings rebuilt: real profile + real KYC badge (was hardcoded "John Doe /
  john.doe@example.com / Verified"), Documents→`/verify/`, Payment→`/wallet/`,
  fake 2FA/biometric/dark-mode toggles removed, prefs persisted per-device,
  sign-out clears auth.
- Withdrawals: server methods + destination now persisted + unknown methods 409.
- **Live market prices**: new `src/lib/market-provider.ts` (Yahoo Finance, no key,
  30 instruments across forex/metals/energy/indices/crypto/equities, 30s cache).
  `MARKET_DATA_URL` still overrides; without any provider it fails closed (503).
  TradingView symbol map extended (indices/futures/SOL).
- `complete-transaction.ts` row-lock and `audit.ts` metadata now auto-adapt to
  Postgres vs SQLite via `DATABASE_URL`.
- `output: "standalone"` + `deno.json` (`nextjs` preset) added for Deno Deploy;
  `.env.example` documents all vars. See `DENO_DEPLOY_CHECKLIST.md`.
- Local standalone quirk found: the standalone server resolves relative
  `file:` SQLite URLs against its own dir and may miss project `.env`, so local
  preview uses absolute `DATABASE_URL` + explicit env + copied `.next/standalone/.env`.
  Production Postgres URLs are unaffected.

## Cleanup pass (2026-09-05) — demo/mock/fake data removed, Axi app reference applied
Reference: Axi Trading Platform (`com.lagom`, AxiTrader) — red/black/cream/gold brand, bottom-tab mobile structure (Home/Markets/Trade/Wallet/Settings), onboarding Register → Verify → Fund, watchlist, positions, funding via configured methods, risk warnings, "not investment advice".

Removed / neutralized:
1. `src/components/LiveChatBot.tsx` — deleted all canned knowledge replies (they invented leverage figures, fees, timings, `support@axi.com`, `+1-800-AXI-TRADE` offline). Widget is now live-AI-only with an honest "unavailable → Help Center" fallback; header no longer claims "Live Support / Online"; fixed broken `/api/assistant` fetch → `/api/assistant/`.
2. `src/app/page.tsx` hero — removed simulated market visual (fake SVG chart, "Live quote" Bid/Ask, "Live feed" badge). Replaced with an honest workspace preview (Watchlist/Portfolio/Positions + 3-step order flow, zero fake numbers). Added Axi-style **Risk warning** section to the footer.
3. `src/app/withdraw/page.tsx` — removed hardcoded Bank/Crypto/Card/Skrill list; methods now load from server `/api/funding/methods/` with an honest empty state.
4. `src/app/api/user/transactions/route.ts` — withdrawals now (a) require an **enabled funding method** (arbitrary method strings rejected, fail-closed like deposits) and (b) persist the user's destination details (previously typed but silently dropped). Still pending until admin review — no auto-approval anywhere (verified: `completeTransaction` runs only via admin review or verified Stripe webhook; trades require KYC `verified` + broker gateway; markets/copy-trading fail closed).
5. Database wiped clean — every table at 0 rows.

Verified after rebuild: `npm run build` ✅ (42 routes), `npm test` ✅ (6/6 security tests), health `ok`, markets honest `503 live:false`, assistant graceful fallback, homepage `200` with no "Live quote" text.

## Restore for production deploy
```bash
cp prisma/schema.prisma.postgres.bak prisma/schema.prisma
cp next.config.js.bak next.config.js
# set Railway env from .env.example: DATABASE_URL (Postgres), JWT_SECRET, RESEND_*, STRIPE_*, MARKET_DATA_URL, etc.
npx prisma generate && npx prisma db push && npm run build
```

Do NOT commit `.env` or `prisma/dev.db`. For real trading, configure `MARKET_DATA_URL` and broker execution env vars — the app fails closed without them by design.
