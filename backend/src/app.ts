import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import type { Env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { createAuthRouter } from './routes/auth.js'
import { createSessionsRouter } from './routes/sessions.js'
import { createUsersRouter } from './routes/users.js'
import { createTokensRouter } from './routes/tokens.js'
import { createApiKeysRouter } from './routes/apiKeys.js'
import { createV1ModelsRouter } from './routes/v1/models.js'
import { createBotRouter } from './routes/bot.js'

export function createApp(env: Env) {
  const app = express()

  const origins = env.FRONTEND_URL.split(',').map((o) => o.trim())

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(
    cors({
      origin: origins,
      credentials: true,
    })
  )
  app.use(cookieParser())
  app.use(express.json({ limit: '2mb' }))

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  )

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'kodari-backend', version: '1.0.0' })
  })

  app.use('/api/auth', createAuthRouter(env))
  app.use('/api/users', createUsersRouter(env))
  app.use('/api/sessions', createSessionsRouter(env))
  app.use('/api/tokens', createTokensRouter(env))
  app.use('/api/api-keys', createApiKeysRouter(env))
  app.use('/api/v1/models', createV1ModelsRouter())
  app.use('/api/bot', createBotRouter(env))

  app.use(errorHandler)
  return app
}
