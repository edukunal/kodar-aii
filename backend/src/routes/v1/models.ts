import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../middleware/errorHandler.js'
import { requireApiKey, type AuthedRequest } from '../../middleware/auth.js'
import { debitTokens } from '../../services/tokens.js'

export function createV1ModelsRouter() {
  const router = Router()
  router.use(requireApiKey())

  router.post('/:model', async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          input: z.string().min(1),
          instruction: z.string().optional(),
        })
        .parse(req.body)

      const model = await prisma.modelDefinition.findUnique({
        where: { slug: req.params.model },
      })
      if (!model) throw new AppError(404, 'Model not found')

      await debitTokens(
        req.userId!,
        model.tokenCost,
        `api_${model.slug}`,
        `API call: ${model.slug}`
      )

      if (model.slug === 'moderation') {
        const toxic = /free ranks|hack|cheat|discord\.gg/i.test(body.input)
        return res.json({
          kodariModel: model.slug,
          tokensCost: model.tokenCost,
          result: {
            safe: !toxic,
            category: toxic ? 'advertising' : 'none',
            severity: toxic ? 'medium' : 'none',
          },
        })
      }

      res.json({
        kodariModel: model.slug,
        tokensCost: model.tokenCost,
        result: {
          output: `Processed: ${body.input.slice(0, 200)}${body.instruction ? ` (${body.instruction})` : ''}`,
        },
      })
    } catch (e) {
      next(e)
    }
  })

  return router
}
