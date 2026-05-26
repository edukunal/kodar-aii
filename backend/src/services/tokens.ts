import { prisma } from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.js'

export async function creditTokens(
  userId: string,
  amount: number,
  type: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  if (amount <= 0) throw new AppError(400, 'Credit amount must be positive')

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: amount },
        tokensEarned: { increment: amount },
      },
    })
    await tx.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
    return user
  })
}

export async function debitTokens(
  userId: string,
  amount: number,
  type: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  if (amount <= 0) throw new AppError(400, 'Debit amount must be positive')

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError(404, 'User not found')
    if (user.tokenBalance < amount) {
      throw new AppError(402, 'Insufficient token balance', 'INSUFFICIENT_TOKENS')
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { decrement: amount },
        tokensSpent: { increment: amount },
      },
    })
    await tx.tokenTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
    return updated
  })
}

export async function claimDailyReward(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.tokenTransaction.findFirst({
    where: {
      userId,
      type: 'daily_reward',
      createdAt: { gte: today },
    },
  })
  if (existing) throw new AppError(429, 'Daily reward already claimed today')

  return creditTokens(userId, 100, 'daily_reward', 'Daily login reward')
}
