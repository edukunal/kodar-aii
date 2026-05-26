'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { Logo } from './Logo'
import { Footer } from './Footer'
import { CookieConsent } from './CookieConsent'
import { cn } from '@/lib/utils'

export function Navbar({ minimal }: { minimal?: boolean }) {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border-subtle bg-bg-base/80 px-6 backdrop-blur-xl">
      <Logo />
      <div className="flex items-center gap-3">
        {!minimal && user && (
          <nav className="hidden items-center gap-4 text-sm text-text-secondary md:flex">
            <Link href="/prompt" className="hover:text-text-primary">
              Build
            </Link>
            <Link href="/history" className="hover:text-text-primary">
              Sessions
            </Link>
            <Link href="/api-keys" className="hover:text-text-primary">
              API
            </Link>
          </nav>
        )}
        {user ? (
          <Link href={`/profile/${user.username}`} className="relative">
            <Image
              src={user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-border-soft"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-base bg-emerald-500" />
          </Link>
        ) : (
          <Link href="/auth/login" className="btn-ghost py-1.5 text-xs">
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base pt-14">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
