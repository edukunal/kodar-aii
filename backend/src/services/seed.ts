import { prisma } from '../lib/prisma.js'

const MODELS = [
  {
    slug: 'moderation',
    name: 'Moderation',
    description:
      'Multilingual chat moderation AI that classifies messages for toxicity, threats, doxxing, and advertising.',
    tokenCost: 2,
    category: 'moderation',
  },
  {
    slug: 'basic',
    name: 'Basic',
    description:
      'Fast general purpose AI. Send an instruction plus input, get a concise direct response.',
    tokenCost: 10,
    category: 'general',
  },
]

export async function seedModels() {
  for (const m of MODELS) {
    await prisma.modelDefinition.upsert({
      where: { slug: m.slug },
      create: m,
      update: {
        name: m.name,
        description: m.description,
        tokenCost: m.tokenCost,
        category: m.category,
      },
    })
  }
}
