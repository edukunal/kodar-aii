# Legacy monolith (deprecated)

The following root-level folders were the original single-repo Kodari V2 build (Next.js + Firebase + inline API):

- `/app`, `/components`, `/lib`, `/hooks`, `/store` — Next.js monolith
- `/backend/server.js` — compile-only Express service (Firebase)
- `/discord-bot/bot.py` — Python Discord bot

**Replaced by:**

| Service | Path | Deploy target |
|---------|------|---------------|
| Frontend SPA | `frontend/` | Vercel / Netlify |
| API | `backend/` | Render |
| Discord bot | `discord/` | Railway / Render worker |

You may delete the legacy folders after verifying the new stack. Screenshots and `KODARI_V2_MASTER_BUILD_PROMPT.md` remain as product reference.
