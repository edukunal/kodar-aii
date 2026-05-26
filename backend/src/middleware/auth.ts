import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../lib/jwt.js'
import { verifyApiKey } from '../lib/apiKey.js'
import { AppError } from './errorHandler.js'
import type { Env } from '../config/env.js'

export type AuthedRequest = Request & {
  userId?: string
  apiKeyId?: string
}

export function requireJwt(env: Env) {
  return async (req: AuthedRequest, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization
      const cookie = req.cookies?.kodari_token as string | undefined
      const token =
        header?.startsWith('Bearer ') ? header.slice(7) : cookie

      if (!token) throw new AppError(401, 'Authentication required')

      const payload = verifyAccessToken(env, token)
      const user = await prisma.user.findFirst({
        where: { id: payload.sub, deletedAt: null },
      })
      if (!user) throw new AppError(401, 'User not found')

      req.userId = user.id
      next()
    } catch (e) {
      if (e instanceof AppError) return next(e)
      next(new AppError(401, 'Invalid or expired token'))
    }
  }
}

export function requireApiKey() {
  return async (req: AuthedRequest, _res: Response, next: NextFunction) => {
    try {
      const raw = req.headers['x-api-key'] as string | undefined
      if (!raw) throw new AppError(401, 'X-API-Key header required')

      const prefix = raw.slice(0, 16)
      const keys = await prisma.apiKey.findMany({
        where: { keyPrefix: prefix, revokedAt: null },
        include: { user: true },
      })

      const match = keys.find((k) => verifyApiKey(raw, k.keyHash))
      if (!match || match.user.deletedAt) {
        throw new AppError(401, 'Invalid API key')
      }

      await prisma.apiKey.update({
        where: { id: match.id },
        data: { lastUsedAt: new Date() },
      })

      req.userId = match.userId
      req.apiKeyId = match.id
      next()
    } catch (e) {
      if (e instanceof AppError) return next(e)
      next(new AppError(401, 'Invalid API key'))
    }
  }
}

export function requireBotSecret(env: Env) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const secret = req.headers['x-kodari-bot-secret']
    if (!env.DISCORD_BOT_API_SECRET || secret !== env.DISCORD_BOT_API_SECRET) {
      return next(new AppError(401, 'Invalid bot secret'))
    }
    next()
  }
}
