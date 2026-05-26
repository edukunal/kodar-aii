import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { signAccessToken } from '../lib/jwt.js'
import { AppError } from '../middleware/errorHandler.js'
import type { Env } from '../config/env.js'
const OAuthProvider = { DISCORD: 'DISCORD', GITHUB: 'GITHUB' } as const
type OAuthProvider = (typeof OAuthProvider)[keyof typeof OAuthProvider]

function setAuthCookie(res: import('express').Response, token: string, env: Env) {
  res.cookie('kodari_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

async function upsertOAuthUser(
  provider: OAuthProvider,
  profile: {
    providerId: string
    displayName: string
    email?: string
    avatarUrl?: string
    discordId?: string
    githubId?: string
    username: string
  }
) {
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerId: { provider, providerId: profile.providerId } },
    include: { user: true },
  })

  if (existing) {
    return prisma.user.update({
      where: { id: existing.userId },
      data: {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        email: profile.email ?? existing.user.email,
      },
    })
  }

  let username = profile.username
  let suffix = 0
  while (await prisma.user.findUnique({ where: { username } })) {
    suffix++
    username = `${profile.username}${suffix}`
  }

  return prisma.user.create({
    data: {
      displayName: profile.displayName,
      username,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      discordId: profile.discordId,
      githubId: profile.githubId,
      termsAcceptedAt: new Date(),
      oauthAccounts: {
        create: { provider, providerId: profile.providerId },
      },
    },
  })
}

export function createAuthRouter(env: Env) {
  const router = Router()

  router.post('/logout', (_req, res) => {
    res.clearCookie('kodari_token')
    res.json({ ok: true })
  })

  // Dev / demo login when OAuth not configured
  router.post('/dev-login', async (req, res, next) => {
    try {
      if (env.NODE_ENV === 'production') {
        throw new AppError(403, 'Dev login disabled in production')
      }
      const body = z
        .object({
          displayName: z.string().min(1).default('Demo User'),
          username: z.string().min(2).optional(),
        })
        .parse(req.body)

      const username = body.username ?? `demo_${crypto.randomBytes(4).toString('hex')}`
      const user = await upsertOAuthUser(OAuthProvider.DISCORD, {
        providerId: `dev_${username}`,
        displayName: body.displayName,
        username,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        discordId: `dev_${username}`,
      })

      const token = signAccessToken(env, { sub: user.id, email: user.email })
      setAuthCookie(res, token, env)
      res.json({ token, user })
    } catch (e) {
      next(e)
    }
  })

  router.get('/discord', (_req, res) => {
    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_REDIRECT_URI) {
      return res.status(503).json({
        error: 'Discord OAuth not configured',
        hint: 'Set DISCORD_CLIENT_ID and DISCORD_REDIRECT_URI or use POST /api/auth/dev-login',
      })
    }
    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      redirect_uri: env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify email',
    })
    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
  })

  router.get('/discord/callback', async (req, res, next) => {
    try {
      if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DISCORD_REDIRECT_URI) {
        throw new AppError(503, 'Discord OAuth not configured')
      }
      const { code } = z.object({ code: z.string() }).parse(req.query)

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: env.DISCORD_REDIRECT_URI,
        }),
      })
      if (!tokenRes.ok) throw new AppError(400, 'Discord token exchange failed')
      const tokens = (await tokenRes.json()) as { access_token: string }

      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (!userRes.ok) throw new AppError(400, 'Failed to fetch Discord profile')
      const discord = (await userRes.json()) as {
        id: string
        username: string
        global_name?: string
        avatar?: string
        email?: string
      }

      const avatarUrl = discord.avatar
        ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`
        : undefined

      const user = await upsertOAuthUser(OAuthProvider.DISCORD, {
        providerId: discord.id,
        displayName: discord.global_name ?? discord.username,
        email: discord.email,
        avatarUrl,
        discordId: discord.id,
        username: discord.username.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      })

      const token = signAccessToken(env, { sub: user.id, email: user.email })
      setAuthCookie(res, token, env)
      res.redirect(`${env.FRONTEND_URL}/prompt`)
    } catch (e) {
      next(e)
    }
  })

  router.get('/github', (_req, res) => {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_REDIRECT_URI) {
      return res.status(503).json({
        error: 'GitHub OAuth not configured',
        hint: 'Set GITHUB_CLIENT_ID or use POST /api/auth/dev-login',
      })
    }
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
    })
    res.redirect(`https://github.com/login/oauth/authorize?${params}`)
  })

  router.get('/github/callback', async (req, res, next) => {
    try {
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_REDIRECT_URI) {
        throw new AppError(503, 'GitHub OAuth not configured')
      }
      const { code } = z.object({ code: z.string() }).parse(req.query)

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_REDIRECT_URI,
        }),
      })
      const tokens = (await tokenRes.json()) as { access_token?: string; error?: string }
      if (!tokens.access_token) throw new AppError(400, tokens.error ?? 'GitHub auth failed')

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/vnd.github+json',
        },
      })
      const gh = (await userRes.json()) as {
        id: number
        login: string
        name?: string
        avatar_url?: string
        email?: string
      }

      const user = await upsertOAuthUser(OAuthProvider.GITHUB, {
        providerId: String(gh.id),
        displayName: gh.name ?? gh.login,
        email: gh.email,
        avatarUrl: gh.avatar_url,
        githubId: String(gh.id),
        username: gh.login.toLowerCase(),
      })

      const token = signAccessToken(env, { sub: user.id, email: user.email })
      setAuthCookie(res, token, env)
      res.redirect(`${env.FRONTEND_URL}/prompt`)
    } catch (e) {
      next(e)
    }
  })

  return router
}
