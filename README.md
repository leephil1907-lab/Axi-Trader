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

## Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/leephil1907-lab/Axi-Trader.git
cd Axi-Trader

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your values

# 4. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 5. Seed database with admin + demo users
npx prisma db seed

# 6. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@axi.com` | `admin123` | Admin |
| `demo@axi.com` | `demo123` | User |

## API Routes

| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/auth/register/` | POST | Create new account | Public |
| `/api/auth/login/` | POST | Login and get JWT | Public |
| `/api/auth/me/` | GET | Get current user | Required |
| `/api/admin/users/` | GET | List all users | Admin only |
| `/api/admin/transactions/` | GET/PATCH | Manage transactions | Admin only |
| `/api/user/transactions/` | GET/POST | User transactions | Required |

## Environment Variables

```env
DATABASE_URL="file:./dev.db"              # SQLite for dev
JWT_SECRET="your-32-char-secret-key"      # Change in production!
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Options

### Option 1: Vercel (Recommended - Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import `leephil1907-lab/Axi-Trader`
4. Framework Preset: **Next.js** (auto-detected)
5. Add Environment Variables:
   - `DATABASE_URL` → `file:./dev.db` (or PostgreSQL URL)
   - `JWT_SECRET` → Generate a 32+ character random string
   - `JWT_EXPIRES_IN` → `7d`
   - `NEXT_PUBLIC_APP_URL` → Your Vercel domain URL
6. Click **Deploy**

**Vercel will auto-detect `vercel.json` and run:**
```bash
npx prisma generate && npx prisma db push && next build
```

### Option 2: Railway (Free Tier Available)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `leephil1907-lab/Axi-Trader`
4. Add a **PostgreSQL** database (New → Database → Add PostgreSQL)
5. Railway auto-injects `DATABASE_URL` for PostgreSQL
6. Add these variables manually:
   - `JWT_SECRET` → 32+ character random string
   - `JWT_EXPIRES_IN` → `7d`
   - `NEXT_PUBLIC_APP_URL` → Your Railway domain URL
7. Deploy!

**Railway uses `railway.toml` for build config.**

### Option 3: Docker (Self-Hosted)

```bash
# Build image
docker build -t axi-trader .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="your-secret-key" \
  -e JWT_EXPIRES_IN="7d" \
  axi-trader
```

### Option 4: Render (Free Tier)

1. Go to [render.com](https://render.com)
2. **New Web Service** → Connect GitHub repo
3. Select `leephil1907-lab/Axi-Trader`
4. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as Vercel)
6. Deploy

## Post-Deployment Setup

After first deploy, seed the database:

```bash
# For Vercel (using Vercel CLI)
vercel env pull
npx prisma db seed

# For Railway (using Railway CLI)
railway run npx prisma db seed

# For Docker (exec into container)
docker exec -it <container-id> npx prisma db seed
```

## Troubleshooting

### Prisma Generate Fails
```bash
# Clear cache and regenerate
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
npm install
npx prisma generate
```

### Database Locked (SQLite)
```bash
# Delete the SQLite file and re-push
rm dev.db
npx prisma db push
npx prisma db seed
```

### Build Fails on Vercel
Make sure `vercel.json` has this build command:
```json
"buildCommand": "npx prisma generate && npx prisma db push && next build"
```

## License

MIT
