# Axi Trader Platform

Full-stack trading platform built with Next.js 14, Prisma, PostgreSQL, and Tailwind CSS.

## Production architecture

- JWT authentication with bcrypt password hashing.
- PostgreSQL/Prisma is the authoritative source for users, balances, transactions, trades, and KYC records.
- No demo users, seeded credentials, simulated balances, simulated fills, or client-side financial state.
- Admin controls are protected by server-side role checks.
- Deposit and withdrawal requests are stored as pending transactions; only authorized server-side review can complete them and change balances.
- KYC submissions and reviews are persisted server-side.
- Market data is exposed through a server-side provider gateway and fails closed when no live provider is configured.
- Trading fails closed when no real broker execution gateway is configured; the UI never reports a simulated order as filled.

## Development

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

There is intentionally no database seed command and no default/demo credential set.

## API routes

- `POST /api/auth/register/` — create a real account.
- `POST /api/auth/login/` — authenticate and receive a JWT.
- `GET /api/auth/me/` — retrieve the authenticated account.
- `GET /api/user/portfolio/` — authenticated portfolio, trades, and transactions.
- `GET|POST /api/user/transactions/` — create/list pending funding requests.
- `GET|POST /api/user/kyc/` — create/list KYC records.
- `GET /api/admin/users/` — admin-only user list.
- `GET|PATCH /api/admin/transactions/` — admin-only transaction review.
- `GET|PATCH /api/admin/kyc/` — admin-only KYC review.
- `GET|POST /api/trades/` — broker-gated trade access; no simulated fills.
- `GET /api/markets/` — server-side live-market provider gateway.

## Required production environment

Configure the values in `.env.example` in Railway. In particular, use a production PostgreSQL `DATABASE_URL`, a strong `JWT_SECRET`, Resend credentials for email workflows, Stripe live credentials/webhook secret for payments, and a real market-data provider. Do not enable broker execution until a real execution adapter and broker credentials have been integrated.

## Deployment

Railway can build and run the Next.js application using the existing `railway.toml`. The database must be PostgreSQL in production.
