'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import Image from 'next/image'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { Github } from 'lucide-react'

export default function LoginPage() {
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const { loginDev } = useAuth()
  const router = useRouter()

  const oauth = (provider: 'discord' | 'github') => {
    if (!terms) return
    window.location.href = api.authUrl(provider)
  }

  const devLogin = async () => {
    if (!terms) return
    setLoading('dev')
    try {
      await loginDev('Kodari Builder')
      router.push('/prompt')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <Navbar minimal />
      <div className="flex min-h-screen items-center justify-center px-4 pt-14">
        <div className="glass-card w-full max-w-md p-8 text-center shadow-glow">
          <Image
            src="https://kodari.ai/current_icon_no_bg.png"
            alt=""
            width={48}
            height={48}
            className="mx-auto"
          />
          <h1 className="mt-4 font-display text-2xl font-bold">Welcome to Kodari</h1>
          <p className="mt-1 text-sm text-text-secondary">Create magic with AI</p>
          <div className="mt-8 space-y-3">
            <button
              type="button"
              disabled={!terms || !!loading}
              onClick={() => oauth('discord')}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              Continue with Discord
            </button>
            <button
              type="button"
              disabled={!terms || !!loading}
              onClick={() => oauth('github')}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border-soft bg-bg-input py-3 text-sm font-medium disabled:opacity-50"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                disabled={!terms || !!loading}
                onClick={devLogin}
                className="w-full rounded-xl border border-dashed border-accent-blue/40 py-2 text-xs text-accent-blue"
              >
                {loading === 'dev' ? 'Signing in...' : 'Dev login (no OAuth)'}
              </button>
            )}
          </div>
          <label className="mt-6 flex items-start gap-3 text-left text-xs text-text-secondary">
            <Checkbox.Root
              checked={terms}
              onCheckedChange={(v) => setTerms(v === true)}
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-soft bg-bg-input data-[state=checked]:bg-accent-blue"
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span>
              I agree to the{' '}
              <Link href="#" className="text-accent-blue">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-accent-blue">
                Privacy Policy
              </Link>
            </span>
          </label>
          <p className="mt-4 text-[10px] text-text-muted">
            Your display name and avatar will be visible to others.
          </p>
        </div>
      </div>
      <Footer />
      <CookieConsent />
    </div>
  )
}
