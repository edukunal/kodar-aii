import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.js'
import { requireJwt, type AuthedRequest } from '../middleware/auth.js'
import type { Env } from '../config/env.js'

export function createUsersRouter(env: Env) {
  const router = Router()

  router.get('/profile/:username', async (req, res, next) => {
    try {
      const user = await prisma.user.findFirst({
        where: { username: req.params.username, deletedAt: null },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          discordId: true,
          memberBadge: true,
          status: true,
          createdAt: true,
        },
      })
      if (!user) throw new AppError(404, 'User not found')
      res.json({ user })
    } catch (e) {
      next(e)
    }
  })

  router.use(requireJwt(env))

  router.get('/me', async (req: AuthedRequest, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId! } })
      if (!user) throw new AppError(404, 'User not found')
      res.json({
        user: { ...user, preferences: JSON.parse(user.preferences || '{}') },
      })
    } catch (e) {
      next(e)
    }
  })

  router.patch('/me', async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          displayName: z.string().min(1).max(64).optional(),
          bio: z.string().max(500).optional(),
          status: z.string().max(32).optional(),
          preferences: z.record(z.unknown()).optional(),
        })
        .parse(req.body)

      const data: Record<string, unknown> = { ...body }
      if (body.preferences) data.preferences = JSON.stringify(body.preferences)

      const user = await prisma.user.update({
        where: { id: req.userId! },
        data,
      })
      res.json({
        user: {
          ...user,
          preferences: JSON.parse(user.preferences || '{}'),
        },
      })
    } catch (e) {
      next(e)
    }
  })

  router.delete('/me', async (req: AuthedRequest, res, next) => {
    try {
      await prisma.user.update({
        where: { id: req.userId! },
        data: { deletedAt: new Date() },
      })
      res.clearCookie('kodari_token')
      res.json({ ok: true })
    } catch (e) {
      next(e)
    }
  })

  return router
}
