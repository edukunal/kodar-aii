const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export type User = {
  id: string
  email?: string | null
  displayName: string
  username: string
  avatarUrl?: string | null
  discordId?: string | null
  bio?: string | null
  status: string
  memberBadge: string
  tokenBalance: number
  tokensEarned: number
  tokensSpent: number
  preferences?: Record<string, unknown>
  isPremium: boolean
  createdAt: string
}

export type ProjectSession = {
  id: string
  kodariId: string
  title: string
  description?: string | null
  projectType: string
  platform: string
  model: string
  visibility: string
  isFavorite: boolean
  isDeleted: boolean
  tokensUsed: number
  files: { path: string; content: string }[]
  messages: { role: string; content: string; at?: string }[]
  createdAt: string
  updatedAt: string
}

export type TokenTransaction = {
  id: string
  amount: number
  type: string
  description: string
  createdAt: string
}

export type ApiKeySummary = {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt?: string | null
  createdAt: string
}

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('kodari_token', token)
      else localStorage.removeItem('kodari_token')
    }
  }

  getToken() {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kodari_token')
    }
    return null
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = this.getToken()
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error ?? `Request failed (${res.status})`)
    }
    return data as T
  }

  devLogin(displayName?: string) {
    return this.request<{ token: string; user: User }>('/api/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    })
  }

  logout() {
    return this.request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
  }

  getMe() {
    return this.request<{ user: User }>('/api/users/me')
  }

  updateMe(data: Partial<User>) {
    return this.request<{ user: User }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  getSessions(tab = 'all') {
    return this.request<{
      sessions: ProjectSession[]
      stats: { total: number; favorites: number; public: number }
    }>(`/api/sessions?tab=${tab}`)
  }

  getSession(id: string) {
    return this.request<{ session: ProjectSession }>(`/api/sessions/${id}`)
  }

  createSession(body: {
    title: string
    prompt?: string
    projectType?: string
    platform?: string
    model?: string
    buildTool?: string
  }) {
    return this.request<{ session: ProjectSession }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  updateSession(id: string, body: Record<string, unknown>) {
    return this.request<{ session: ProjectSession }>(`/api/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  chatSession(id: string, message: string) {
    return this.request<{ session: ProjectSession; reply: { content: string } }>(
      `/api/sessions/${id}/chat`,
      { method: 'POST', body: JSON.stringify({ message }) }
    )
  }

  getTokenBalance() {
    return this.request<{ balance: number; earned: number; spent: number }>(
      '/api/tokens/balance'
    )
  }

  getTokenHistory() {
    return this.request<{ transactions: TokenTransaction[] }>('/api/tokens/history')
  }

  claimDaily() {
    return this.request<{ user: User; credited: number }>('/api/tokens/daily', {
      method: 'POST',
    })
  }

  getApiKeys() {
    return this.request<{ keys: ApiKeySummary[]; limit: number; count: number }>(
      '/api/api-keys'
    )
  }

  createApiKey(name: string) {
    return this.request<{ key: ApiKeySummary; secret: string }>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  revokeApiKey(id: string) {
    return this.request<{ ok: boolean }>(`/api/api-keys/${id}`, { method: 'DELETE' })
  }

  getModelsDocs() {
    return this.request<{
      endpoint: string
      models: { slug: string; name: string; description: string; tokenCost: number }[]
    }>('/api/api-keys/models')
  }

  getProfile(username: string) {
    return this.request<{ user: Partial<User> }>(`/api/users/profile/${username}`)
  }

  authUrl(provider: 'discord' | 'github') {
    return `${API_URL}/api/auth/${provider}`
  }
}

export const api = new ApiClient()
