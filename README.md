# Kodari Platform

Three deployable services that share one API contract: **frontend** (Next.js), **backend** (Express + PostgreSQL), and **discord** (discord.js bot).

```
┌─────────────┐     JWT / cookies      ┌─────────────┐
│  frontend/  │ ◄──────────────────► │  backend/   │
│  :3000      │     REST + CORS        │  :4000      │
└─────────────┘                        └──────▲──────┘
                                              │ X-Kodari-Bot-Secret
                                       ┌──────┴──────┐
                                       │  discord/   │
                                       └─────────────┘
```

## Quick start (local)

### 1. Database

Local dev uses **SQLite** (`file:./prisma/dev.db`) by default — no Docker required.

For production, switch `backend/prisma/schema.prisma` to `postgresql` and run:

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cp backend/.env.example backend/.env
# Edit DATABASE_URL and JWT_SECRET (min 16 chars)

cd backend
npm install
npx prisma db push
npm run dev
```

API: http://localhost:4000/health

### 3. Frontend

```bash
cp frontend/.env.example frontend/.env.local

cd frontend
npm install
npm run dev
```

App: http://localhost:3000

**Dev auth:** On the login page, use **Dev login** when OAuth credentials are not set (development only).

### 4. Discord bot (optional)

```bash
cp discord/.env.example discord/.env
# Set DISCORD_TOKEN, DISCORD_CLIENT_ID, KODARI_BOT_API_SECRET (match backend)

cd discord
npm install
npm run dev
```

Slash commands: `/link`, `/balance`, `/daily`

### All services (from repo root)

```bash
npm install
npm run db:up
npm run db:migrate
npm run dev
```

## Environment contract

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `JWT_SECRET` | backend | Signs user JWTs (≥16 chars) |
| `FRONTEND_URL` | backend | CORS origin(s), comma-separated |
| `DISCORD_CLIENT_ID/SECRET` | backend | OAuth (optional) |
| `GITHUB_CLIENT_ID/SECRET` | backend | OAuth (optional) |
| `DISCORD_BOT_API_SECRET` | backend + discord | Bot ↔ API auth header |
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL |
| `DISCORD_TOKEN` | discord | Bot token from Discord Developer Portal |

## Features (MVP)

- Discord + GitHub OAuth (or dev login)
- Prompt home, project type modal, sessions dashboard
- IDE session view with file tree + AI chat (mock responses)
- Profile, settings, API keys (max 5), token ledger
- Public API: `POST /api/v1/models/{model}` with `X-API-Key`
- Discord bot: balance, daily reward, account link via API only

## Deploy

| App | Target | Notes |
|-----|--------|-------|
| `frontend/` | Vercel / Netlify | Set `NEXT_PUBLIC_API_URL` to production API |
| `backend/` | Render | See `backend/render.yaml` |
| `discord/` | Railway worker | Long-running process, env from table above |

## Legacy code

The original Firebase monolith at the repo root is documented in [archive/LEGACY.md](archive/LEGACY.md). Prefer `frontend/`, `backend/`, and `discord/` for all new work.

## Blockers for production

- Real **Discord** and **GitHub** OAuth app credentials
- **PostgreSQL** on Render (or external provider)
- **DISCORD_TOKEN** for the bot
- Optional: wire real LLM providers instead of mock AI chat/responses
