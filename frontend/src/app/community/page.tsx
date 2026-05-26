import Link from 'next/link'
import { AppShell } from '@/components/layout/Navbar'
import { Compass } from 'lucide-react'

export default function CommunityPage() {
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Community Plugins</h1>
      <p className="mt-2 text-text-secondary">Discover projects built by the Kodari community.</p>
      <div className="glass-card mt-12 flex flex-col items-center py-20 text-center">
        <Compass className="h-12 w-12 text-accent-blue" />
        <p className="mt-4 text-text-muted">Marketplace launching soon.</p>
        <Link href="/prompt" className="btn-primary mt-6">
          Start building
        </Link>
      </div>
    </AppShell>
  )
}
