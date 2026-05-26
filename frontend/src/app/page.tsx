import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { Typewriter } from '@/components/prompt/Typewriter'
import { Sparkles, ArrowUpRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <Navbar minimal />
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 pt-24 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Hi! I&apos;m Kodari :)
        </h1>
        <p className="mt-4 text-lg text-text-secondary sm:text-xl">
          Let&apos;s turn your idea into <span className="text-accent-blue">reality.</span>
        </p>
        <Link
          href="/prompt"
          className="mt-10 flex w-full max-w-2xl flex-col rounded-2xl border border-border-dim bg-bg-card/60 p-4 text-left shadow-glow backdrop-blur-xl transition hover:border-accent-blue/40"
        >
          <span className="text-text-muted">Ask Kodari to create a config about...</span>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2 text-xs text-text-muted">
              <span className="rounded-full border border-border-soft px-3 py-1">Claude Sonnet 4.5</span>
              <span className="rounded-full border border-border-soft px-3 py-1">Java Plugin</span>
            </div>
            <span className="btn-primary flex h-9 w-9 items-center justify-center rounded-xl p-0">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
          <Link href="/community" className="inline-flex items-center gap-2 hover:text-accent-blue">
            <Sparkles className="h-4 w-4" />
            Explore Community Plugins
          </Link>
          <Link href="/history" className="inline-flex items-center gap-2 hover:text-accent-blue">
            Your Projects
          </Link>
        </div>
        <Typewriter />
      </section>
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-24">
        <h2 className="text-center font-display text-3xl font-bold">Simple pricing</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { name: 'Free', price: '$0', tokens: '500/mo' },
            { name: 'Pro', price: '$12', tokens: '25k/mo', highlight: true },
            { name: 'Team', price: '$49', tokens: '100k/mo' },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`glass-card p-6 ${tier.highlight ? 'border-accent-blue/40 shadow-glow' : ''}`}
            >
              <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
              <p className="mt-2 text-3xl font-bold">{tier.price}</p>
              <p className="mt-1 text-sm text-text-muted">{tier.tokens} tokens</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      <CookieConsent />
    </div>
  )
}
