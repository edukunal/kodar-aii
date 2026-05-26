const API_URL = process.env.KODARI_API_URL ?? 'http://localhost:4000'
const BOT_SECRET = process.env.KODARI_BOT_API_SECRET ?? ''

async function botFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Kodari-Bot-Secret': BOT_SECRET,
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `API ${res.status}`)
  return data as T
}

export const kodariApi = {
  linkUser(discordId: string, username: string, displayName: string) {
    return botFetch<{ user: { tokenBalance: number; username: string } }>('/api/bot/link', {
      method: 'POST',
      body: JSON.stringify({ discordId, username, displayName }),
    })
  },

  getUser(discordId: string) {
    return botFetch<{
      user: { tokenBalance: number; username: string; displayName: string }
    }>(`/api/bot/user/${discordId}`)
  },

  claimDaily(discordId: string) {
    return botFetch<{ balance: number; credited: number }>(`/api/bot/daily/${discordId}`, {
      method: 'POST',
    })
  },
}
