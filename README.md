# Axi Trader Platform

A full-stack trading platform built with Next.js 14, Prisma, and Tailwind CSS.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Admin Panel**: Protected admin routes for user/transaction management
- **Trading**: Real-time market data, open positions, transaction history
- **Responsive**: Mobile-first design with Tailwind CSS
- **SEO**: Full meta tags, Open Graph, Twitter Cards, robots.txt

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Next.js API Routes, Prisma ORM, JWT Auth
- **Database**: SQLite (development) / PostgreSQL (production)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 3. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 4. Seed database with admin + demo users
npx prisma db seed

# 5. Run development server
npm run dev
```

## Default Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@axi.com` | `admin123` | Admin |
| `demo@axi.com` | `demo123` | User |

## Environment Variables

```env
DATABASE_URL="file:./dev.db"              # SQLite for dev
JWT_SECRET="your-32-char-secret-key"      # Change in production!
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register/` | POST | Create new account |
| `/api/auth/login/` | POST | Login and get JWT |
| `/api/auth/me/` | GET | Get current user |
| `/api/admin/users/` | GET | List all users (admin only) |
| `/api/admin/transactions/` | GET/PATCH | Manage transactions (admin only) |
| `/api/user/transactions/` | GET/POST | User transactions |

## Deployment

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway up
```

## License

MIT
