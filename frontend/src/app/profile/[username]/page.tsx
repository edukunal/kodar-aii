'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AppShell } from '@/components/layout/Navbar'
import { api, type User } from '@/lib/api'
import { Sparkles } from 'lucide-react'

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Partial<User> | null>(null)

  useEffect(() => {
    api.getProfile(params.username).then((r) => setProfile(r.user))
  }, [params.username])

  if (!profile) {
    return (
      <AppShell>
        <p className="text-text-muted">Loading profile...</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="glass-card mx-auto max-w-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-accent-blue/30 to-accent-purple/30" />
        <div className="relative px-8 pb-8">
          <Image
            src={
              profile.avatarUrl ??
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
            }
            alt=""
            width={96}
            height={96}
            className="-mt-12 rounded-2xl border-4 border-bg-card"
          />
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold">{profile.displayName}</h1>
              <p className="text-text-muted">@{profile.username}</p>
              <span className="mt-2 inline-block rounded-full bg-accent-blue/15 px-3 py-0.5 text-xs text-accent-blue capitalize">
                {profile.memberBadge ?? 'member'}
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400 capitalize">
              {profile.status ?? 'online'}
            </span>
          </div>
          {profile.bio && <p className="mt-4 text-sm text-text-secondary">{profile.bio}</p>}
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="text-text-muted">Discord ID</dt>
              <dd className="font-mono">{profile.discordId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Joined</dt>
              <dd>
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
          </dl>
          <div className="mt-8 rounded-xl border border-border-dim bg-bg-input/50 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-accent-purple" />
              Enchantments
            </h2>
            <p className="mt-2 text-xs text-text-muted">Coming soon — unlock achievements and perks.</p>
          </div>
          <Link href="/settings" className="btn-ghost mt-6 inline-block">
            Edit profile
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
