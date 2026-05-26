import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireJwt, type AuthedRequest } from '../middleware/auth.js'
import type { Env } from '../config/env.js'
import { claimDailyReward } from '../services/tokens.js'

export function createTokensRouter(env: Env) {
  const router = Router()
  router.use(requireJwt(env))

  router.get('/balance', async (req: AuthedRequest, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId! } })
      res.json({
        balance: user?.tokenBalance ?? 0,
        earned: user?.tokensEarned ?? 0,
        spent: user?.tokensSpent ?? 0,
      })
    } catch (e) {
      next(e)
    }
  })

  router.get('/history', async (req: AuthedRequest, res, next) => {
    try {
      const query = z.object({ limit: z.coerce.number().max(100).default(50) }).parse(req.query)
      const transactions = await prisma.tokenTransaction.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
      })
      res.json({ transactions })
    } catch (e) {
      next(e)
    }
  })

  router.post('/daily', async (req: AuthedRequest, res, next) => {
    try {
      const user = await claimDailyReward(req.userId!)
      res.json({ user, credited: 100 })
    } catch (e) {
      next(e)
    }
  })

  return router
}
