'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/Navbar'
import { useAuth } from '@/lib/auth'
import { api, type ApiKeySummary } from '@/lib/api'
import { Key, Box, ExternalLink, Coins } from 'lucide-react'

export default function ApiKeysPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKeySummary[]>([])
  const [limit, setLimit] = useState(5)
  const [name, setName] = useState('')
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [docs, setDocs] = useState<{
    endpoint: string
    models: { slug: string; name: string; description: string; tokenCost: number }[]
  } | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    api.getApiKeys().then((r) => {
      setKeys(r.keys)
      setLimit(r.limit)
    })
    api.getModelsDocs().then(setDocs)
  }, [user])

  const create = async () => {
    if (!name.trim()) return
    const { key, secret } = await api.createApiKey(name)
    setNewSecret(secret)
    setName('')
    setKeys((k) => [key, ...k])
  }

  if (loading || !user) return null

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">API Keys</h1>
      <p className="mt-1 text-text-secondary">Manage keys for programmatic access</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="glass-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Key className="h-4 w-4 text-accent-blue" />
                Create Key
              </h2>
              <span className="text-xs text-text-muted">
                {keys.length} / {limit}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this key"
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={create}
                disabled={keys.length >= limit || !name.trim()}
                className="btn-primary"
              >
                Create Key
              </button>
            </div>
            {newSecret && (
              <p className="mt-3 rounded-lg bg-amber-500/10 p-3 font-mono text-xs text-amber-200">
                Copy now — won&apos;t be shown again: {newSecret}
              </p>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Key className="h-4 w-4 text-accent-blue" />
              Your Keys
            </h2>
            {keys.length === 0 ? (
              <p className="mt-8 py-8 text-center text-text-muted">No API keys yet</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {keys.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center justify-between rounded-xl border border-border-dim px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{k.name}</p>
                      <p className="font-mono text-xs text-text-muted">{k.keyPrefix}••••••••</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-400"
                      onClick={async () => {
                        await api.revokeApiKey(k.id)
                        setKeys((prev) => prev.filter((x) => x.id !== k.id))
                      }}
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Box className="h-4 w-4 text-accent-blue" />
              Models
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                POST
              </span>
              <code className="text-xs text-text-secondary">
                {docs?.endpoint ?? `${apiBase}/api/v1/models/{model}`}
              </code>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Requires <code className="text-accent-blue">X-API-Key</code> header.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] text-text-secondary">
                {`curl -X POST ${apiBase}/api/v1/models/moderation \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"join my server..."}'`}
              </pre>
              <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 font-mono text-[10px] text-text-secondary">
                {`{
  "kodariModel": "moderation",
  "tokensCost": 2,
  "result": { "safe": false, "category": "advertising" }
}`}
              </pre>
            </div>
            <div className="mt-6 space-y-4">
              {docs?.models.map((m) => (
                <div key={m.slug} className="border-t border-border-subtle pt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-accent-blue">{m.slug}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                      <Coins className="h-3 w-3" />
                      {m.tokenCost}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{m.description}</p>
                  <span className="mt-2 inline-block rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                    POST /models/{m.slug}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="glass-card h-fit p-6">
          <h3 className="text-sm font-semibold">SDKs</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {['kodarijava', 'kodaripython'].map((sdk) => (
              <li key={sdk}>
                <a href="#" className="flex items-center justify-between text-accent-blue hover:underline">
                  {sdk}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AppShell>
  )
}
