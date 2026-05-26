import 'dotenv/config'
import { loadEnv } from './config/env.js'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'
import { seedModels } from './services/seed.js'

async function main() {
  const env = loadEnv()
  await seedModels()

  const app = createApp(env)
  app.listen(env.PORT, () => {
    console.log(`Kodari API listening on http://localhost:${env.PORT}`)
    console.log(`CORS origins: ${env.FRONTEND_URL}`)
  })
}

main().catch((err) => {
  console.error(err)
  prisma.$disconnect()
  process.exit(1)
})
