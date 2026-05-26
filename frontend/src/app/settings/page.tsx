'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Switch from '@radix-ui/react-switch'
import { AppShell } from '@/components/layout/Navbar'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, loading, logout, refresh } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    publicProfile: true,
    experimentalAi: false,
  })

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
    if (user) {
      setDisplayName(user.displayName)
      const p = (user.preferences ?? {}) as Record<string, boolean>
      setPrefs({
        emailNotifications: p.emailNotifications ?? true,
        publicProfile: p.publicProfile ?? true,
        experimentalAi: p.experimentalAi ?? false,
      })
    }
  }, [user, loading, router])

  const save = async () => {
    await api.updateMe({ displayName, preferences: prefs })
    await refresh()
  }

  const deleteAccount = async () => {
    if (!confirm('Permanently delete your account?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    })
    await logout()
    router.push('/')
  }

  if (loading || !user) return null

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-text-secondary">Manage your Kodari account</p>

      <section className="glass-card mt-8 space-y-4 p-6">
        <h2 className="text-sm font-semibold text-text-muted">Account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-text-muted">Profile ID</label>
            <p className="font-mono text-sm">{user.id}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted">Discord ID</label>
            <p className="font-mono text-sm">{user.discordId ?? '—'}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-base mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Email</label>
            <p className="text-sm">{user.email ?? '—'}</p>
          </div>
        </div>
        <button type="button" onClick={save} className="btn-primary">
          Save changes
        </button>
      </section>

      <section className="glass-card mt-6 space-y-4 p-6">
        <h2 className="text-sm font-semibold text-text-muted">Preferences</h2>
        {(
          [
            ['emailNotifications', 'Email notifications'],
            ['publicProfile', 'Public profile'],
            ['experimentalAi', 'Experimental AI features'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm">{label}</span>
            <Switch.Root
              checked={prefs[key]}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
              className={cn(
                'relative h-6 w-11 rounded-full bg-bg-input data-[state=checked]:bg-accent-blue'
              )}
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
        <p className="mt-1 text-xs text-text-muted">Delete your account and all projects permanently.</p>
        <button
          type="button"
          onClick={deleteAccount}
          className="mt-4 rounded-xl border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          Delete account
        </button>
      </section>
    </AppShell>
  )
}
