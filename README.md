# Axi Trader Platform

Full-stack trading platform built with Next.js 14, Prisma, PostgreSQL, and Tailwind CSS.

## Production architecture

- PostgreSQL/Prisma is the authoritative source for users, balances, transactions, trades, and KYC records.
- Financial account state is read from authenticated server-side data sources.
- Admin controls are protected by server-side role checks.
- Deposit and withdrawal requests are stored as pending transactions; only authorized server-side review can complete them and change balances.
- KYC submissions and reviews are persisted server-side.
- Market data is exposed through a server-side provider gateway and fails closed when no live provider is configured.
- Trading fails closed when no broker execution gateway is configured.

## Development

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

## API routes

- `POST /api/auth/register/` — create an account.
- `POST /api/auth/login/` — authenticate and receive a JWT.
- `GET /api/auth/me/` — retrieve the authenticated account.
- `GET /api/user/portfolio/` — authenticated portfolio, trades, and transactions.
- `GET|POST /api/user/transactions/` — create/list pending funding requests.
- `GET|POST /api/user/kyc/` — create/list KYC records.
- `GET /api/admin/users/` — admin-only user list.
- `GET|PATCH /api/admin/transactions/` — admin-only transaction review.
- `GET|PATCH /api/admin/kyc/` — admin-only KYC review.
- `GET|POST /api/trades/` — broker-gated trade access.
- `GET /api/markets/` — server-side live-market provider gateway.

## Required production environment

Configure the values in `.env.example` in Railway. Use a production PostgreSQL `DATABASE_URL`, a strong `JWT_SECRET`, Resend credentials for email workflows, Stripe live credentials and webhook secret for payments, and a real market-data provider. Do not enable broker execution until a real execution adapter and broker credentials have been integrated.

## Deployment

Railway can build and run the Next.js application using the existing `railway.toml`. The database must be PostgreSQL in production.
