import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const PREFIX = 'kdr_live_'

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const secret = crypto.randomBytes(24).toString('hex')
  const raw = `${PREFIX}${secret}`
  const prefix = raw.slice(0, 16)
  const hash = bcrypt.hashSync(raw, 10)
  return { raw, prefix, hash }
}

export function verifyApiKey(raw: string, hash: string): boolean {
  return bcrypt.compareSync(raw, hash)
}
