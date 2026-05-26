import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireBotSecret } from '../middleware/auth.js'
import type { Env } from '../config/env.js'
import { claimDailyReward, creditTokens } from '../services/tokens.js'
import { AppError } from '../middleware/errorHandler.js'

export function createBotRouter(env: Env) {
  const router = Router()
  router.use(requireBotSecret(env))

  router.get('/user/:discordId', async (req, res, next) => {
    try {
      const user = await prisma.user.findFirst({
        where: { discordId: req.params.discordId, deletedAt: null },
        select: {
          id: true,
          username: true,
          displayName: true,
          tokenBalance: true,
          tokensEarned: true,
          tokensSpent: true,
        },
      })
      if (!user) throw new AppError(404, 'User not linked — sign in at kodari.ai first')
      res.json({ user })
    } catch (e) {
      next(e)
    }
  })

  router.post('/daily/:discordId', async (req, res, next) => {
    try {
      const user = await prisma.user.findFirst({
        where: { discordId: req.params.discordId, deletedAt: null },
      })
      if (!user) throw new AppError(404, 'User not found')
      const updated = await claimDailyReward(user.id)
      res.json({ balance: updated.tokenBalance, credited: 100 })
    } catch (e) {
      next(e)
    }
  })

  router.post('/link', async (req, res, next) => {
    try {
      const body = z
        .object({
          discordId: z.string(),
          username: z.string(),
          displayName: z.string(),
        })
        .parse(req.body)

      let user = await prisma.user.findFirst({ where: { discordId: body.discordId } })
      if (!user) {
        const baseUsername = body.username.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        let username = baseUsername
        let n = 0
        while (await prisma.user.findUnique({ where: { username } })) {
          n++
          username = `${baseUsername}${n}`
        }
        user = await prisma.user.create({
          data: {
            discordId: body.discordId,
            username,
            displayName: body.displayName,
            avatarUrl: `https://cdn.discordapp.com/embed/avatars/0.png`,
          },
        })
        await creditTokens(user.id, 500, 'signup', 'Welcome bonus')
      }
      res.json({ user })
    } catch (e) {
      next(e)
    }
  })

  return router
}
