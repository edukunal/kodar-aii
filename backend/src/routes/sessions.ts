import { Router } from 'express'
import { z } from 'zod'
const Visibility = { PRIVATE: 'PRIVATE', PUBLIC: 'PUBLIC', SHARED: 'SHARED' } as const
import { prisma } from '../lib/prisma.js'
import { generateKodariSessionId } from '../lib/kodariId.js'
import { AppError } from '../middleware/errorHandler.js'
import { requireJwt, type AuthedRequest } from '../middleware/auth.js'
import type { Env } from '../config/env.js'
import { debitTokens } from '../services/tokens.js'

function parseSession<T extends { files: string; messages: string; preferences?: string }>(
  session: T
) {
  return {
    ...session,
    files: JSON.parse(session.files || '[]'),
    messages: JSON.parse(session.messages || '[]'),
  }
}

const DEFAULT_FILES = [
  {
    path: 'src/main/java/com/kodari/plugin/Main.java',
    content: `package com.kodari.plugin;\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic class Main extends JavaPlugin {\n    @Override\n    public void onEnable() {\n        getLogger().info("Plugin enabled!");\n    }\n}\n`,
  },
  { path: 'plugin.yml', content: 'name: KodariPlugin\nversion: 1.0\nmain: com.kodari.plugin.Main\napi-version: 1.20\n' },
  { path: 'build.gradle', content: "plugins { id 'java' }\nrepositories { mavenCentral(); maven { url 'https://repo.papermc.io/repository/maven-public/' } }\ndependencies { compileOnly 'io.papermc.paper:paper-api:1.20.4-R0.1-SNAPSHOT' }\n" },
]

export function createSessionsRouter(env: Env) {
  const router = Router()
  router.use(requireJwt(env))

  router.get('/', async (req: AuthedRequest, res, next) => {
    try {
      const query = z
        .object({
          tab: z.enum(['all', 'favorites', 'public', 'shared', 'deleted']).default('all'),
        })
        .parse(req.query)

      const where: Record<string, unknown> = { userId: req.userId! }

      if (query.tab === 'deleted') {
        where.isDeleted = true
      } else {
        where.isDeleted = false
        if (query.tab === 'favorites') where.isFavorite = true
        if (query.tab === 'public') where.visibility = Visibility.PUBLIC
        if (query.tab === 'shared') where.visibility = Visibility.SHARED
      }

      const sessions = await prisma.projectSession.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      })

      const stats = {
        total: await prisma.projectSession.count({
          where: { userId: req.userId!, isDeleted: false },
        }),
        favorites: await prisma.projectSession.count({
          where: { userId: req.userId!, isFavorite: true, isDeleted: false },
        }),
        public: await prisma.projectSession.count({
          where: { userId: req.userId!, visibility: Visibility.PUBLIC, isDeleted: false },
        }),
      }

      res.json({ sessions: sessions.map(parseSession), stats })
    } catch (e) {
      next(e)
    }
  })

  router.get('/:id', async (req: AuthedRequest, res, next) => {
    try {
      const session = await prisma.projectSession.findFirst({
        where: {
          OR: [{ id: req.params.id }, { kodariId: req.params.id }],
          userId: req.userId!,
        },
      })
      if (!session) throw new AppError(404, 'Session not found')
      res.json({ session: parseSession(session) })
    } catch (e) {
      next(e)
    }
  })

  router.post('/', async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(120),
          prompt: z.string().optional(),
          projectType: z.string().default('java_plugin'),
          platform: z.string().default('minecraft_java'),
          buildTool: z.string().optional(),
          model: z.string().default('claude-sonnet-4.5'),
        })
        .parse(req.body)

      await debitTokens(req.userId!, 50, 'session_create', `Created session: ${body.title}`)

      const session = await prisma.projectSession.create({
        data: {
          kodariId: generateKodariSessionId(),
          userId: req.userId!,
          title: body.title,
          description: body.prompt,
          projectType: body.projectType,
          platform: body.platform,
          buildTool: body.buildTool ?? 'gradle',
          model: body.model,
          files: JSON.stringify(DEFAULT_FILES),
          tokensUsed: 50,
          messages: JSON.stringify(
            body.prompt
              ? [{ role: 'user', content: body.prompt, at: new Date().toISOString() }]
              : []
          ),
        },
      })

      res.status(201).json({ session: parseSession(session) })
    } catch (e) {
      next(e)
    }
  })

  router.patch('/:id', async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().optional(),
          isFavorite: z.boolean().optional(),
          visibility: z.enum(['PRIVATE', 'PUBLIC', 'SHARED']).optional(),
          isDeleted: z.boolean().optional(),
          files: z.array(z.object({ path: z.string(), content: z.string() })).optional(),
          messages: z.array(z.record(z.unknown())).optional(),
        })
        .parse(req.body)

      const { files, messages, ...rest } = body
      const data: Record<string, unknown> = { ...rest }
      if (files) data.files = JSON.stringify(files)
      if (messages) data.messages = JSON.stringify(messages)
      if (body.isDeleted === true) data.deletedAt = new Date()
      if (body.isDeleted === false) data.deletedAt = null

      const existing = await prisma.projectSession.findFirst({
        where: {
          OR: [{ id: req.params.id }, { kodariId: req.params.id }],
          userId: req.userId!,
        },
      })
      if (!existing) throw new AppError(404, 'Session not found')

      const session = await prisma.projectSession.update({
        where: { id: existing.id },
        data,
      })
      res.json({ session: parseSession(session) })
    } catch (e) {
      next(e)
    }
  })

  router.post('/:id/chat', async (req: AuthedRequest, res, next) => {
    try {
      const body = z.object({ message: z.string().min(1) }).parse(req.body)
      const existing = await prisma.projectSession.findFirst({
        where: {
          OR: [{ id: req.params.id }, { kodariId: req.params.id }],
          userId: req.userId!,
        },
      })
      if (!existing) throw new AppError(404, 'Session not found')

      await debitTokens(req.userId!, 25, 'ai_chat', `Chat in ${existing.kodariId}`)

      const prev = JSON.parse(existing.messages || '[]') as object[]
      const messages = [
        ...prev,
        { role: 'user', content: body.message, at: new Date().toISOString() },
        {
          role: 'assistant',
          content: `I'll help you build **${existing.title}**. Based on your request, I recommend starting with the main listener class and updating plugin.yml. Want me to generate the full implementation?`,
          at: new Date().toISOString(),
        },
      ]

      const session = await prisma.projectSession.update({
        where: { id: existing.id },
        data: {
          messages: JSON.stringify(messages),
          tokensUsed: { increment: 25 },
        },
      })

      res.json({ session: parseSession(session), reply: messages[messages.length - 1] })
    } catch (e) {
      next(e)
    }
  })

  return router
}
