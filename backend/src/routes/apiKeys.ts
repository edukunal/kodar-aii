import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { generateApiKey } from '../lib/apiKey.js'
import { AppError } from '../middleware/errorHandler.js'
import { requireJwt, type AuthedRequest } from '../middleware/auth.js'
import type { Env } from '../config/env.js'

const MAX_KEYS = 5

export function createApiKeysRouter(env: Env) {
  const router = Router()
  router.use(requireJwt(env))

  router.get('/', async (req: AuthedRequest, res, next) => {
    try {
      const keys = await prisma.apiKey.findMany({
        where: { userId: req.userId!, revokedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          lastUsedAt: true,
          createdAt: true,
        },
      })
      res.json({ keys, limit: MAX_KEYS, count: keys.length })
    } catch (e) {
      next(e)
    }
  })

  router.post('/', async (req: AuthedRequest, res, next) => {
    try {
      const body = z.object({ name: z.string().min(1).max(64) }).parse(req.body)
      const count = await prisma.apiKey.count({
        where: { userId: req.userId!, revokedAt: null },
      })
      if (count >= MAX_KEYS) {
        throw new AppError(400, `Maximum ${MAX_KEYS} API keys allowed`)
      }

      const { raw, prefix, hash } = generateApiKey()
      const key = await prisma.apiKey.create({
        data: {
          userId: req.userId!,
          name: body.name,
          keyHash: hash,
          keyPrefix: prefix,
        },
      })

      res.status(201).json({
        key: {
          id: key.id,
          name: key.name,
          keyPrefix: key.keyPrefix,
          createdAt: key.createdAt,
        },
        secret: raw,
      })
    } catch (e) {
      next(e)
    }
  })

  router.delete('/:id', async (req: AuthedRequest, res, next) => {
    try {
      const key = await prisma.apiKey.findFirst({
        where: { id: req.params.id, userId: req.userId! },
      })
      if (!key) throw new AppError(404, 'Key not found')

      await prisma.apiKey.update({
        where: { id: key.id },
        data: { revokedAt: new Date() },
      })
      res.json({ ok: true })
    } catch (e) {
      next(e)
    }
  })

  router.get('/models', async (_req, res, next) => {
    try {
      const models = await prisma.modelDefinition.findMany({ orderBy: { tokenCost: 'asc' } })
      res.json({
        endpoint: `${env.API_PUBLIC_URL}/api/v1/models/{model}`,
        models,
      })
    } catch (e) {
      next(e)
    }
  })

  return router
}
