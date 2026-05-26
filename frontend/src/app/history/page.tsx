'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/Navbar'
import { SessionCard } from '@/components/sessions/SessionCard'
import { useAuth } from '@/lib/auth'
import { api, type ProjectSession } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Globe, Grid3X3, List, Star, Trash2, Users, Folder } from 'lucide-react'

const TABS = [
  { id: 'all', label: 'All Sessions', icon: Folder },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'public', label: 'Public', icon: Globe },
  { id: 'shared', label: 'Shared', icon: Users },
  { id: 'deleted', label: 'Deleted', icon: Trash2 },
] as const

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all')
  const [sessions, setSessions] = useState<ProjectSession[]>([])
  const [stats, setStats] = useState({ total: 0, favorites: 0, public: 0 })
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    api.getSessions(tab).then((r) => {
      setSessions(r.sessions)
      setStats(r.stats)
    })
  }, [user, tab])

  const toggleFavorite = async (id: string, value: boolean) => {
    await api.updateSession(id, { isFavorite: value })
    const r = await api.getSessions(tab)
    setSessions(r.sessions)
  }

  if (authLoading || !user) return null

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Your Sessions</h1>
        <p className="mt-1 text-text-secondary">Manage and continue your projects.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-muted">
          <span>{stats.total} Total</span>
          <span>{stats.favorites} Favorites</span>
          <span>{stats.public} Public</span>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition',
                tab === t.id
                  ? 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue shadow-glow-sm'
                  : 'border-border-dim text-text-secondary hover:border-border-soft'
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-border-dim p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={cn('rounded-md p-1.5', view === 'grid' && 'bg-accent-blue/20 text-accent-blue')}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn('rounded-md p-1.5', view === 'list' && 'bg-accent-blue/20 text-accent-blue')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      {sessions.length === 0 ? (
        <div className="glass-card py-16 text-center text-text-muted">No sessions yet — start building!</div>
      ) : (
        <div className={cn(view === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4')}>
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} onFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
