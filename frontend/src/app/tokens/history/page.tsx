'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/Navbar'
import { useAuth } from '@/lib/auth'
import { api, type TokenTransaction } from '@/lib/api'
import { Coins, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TokenHistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [balance, setBalance] = useState({ balance: 0, earned: 0, spent: 0 })
  const [tx, setTx] = useState<TokenTransaction[]>([])

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    api.getTokenBalance().then(setBalance)
    api.getTokenHistory().then((r) => setTx(r.transactions))
  }, [user])

  const claimDaily = async () => {
    try {
      await api.claimDaily()
      api.getTokenBalance().then(setBalance)
      api.getTokenHistory().then((r) => setTx(r.transactions))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Already claimed')
    }
  }

  if (loading || !user) return null

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Token History</h1>
      <p className="mt-1 text-text-secondary">Track your balance and transactions</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted">Balance</p>
          <p className="mt-1 flex items-center gap-2 font-display text-3xl font-bold">
            <Coins className="h-6 w-6 text-amber-400" />
            {balance.balance.toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted">Earned</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-emerald-400">
            <TrendingUp className="h-5 w-5" />
            {balance.earned.toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted">Spent</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-text-secondary">
            <TrendingDown className="h-5 w-5" />
            {balance.spent.toLocaleString()}
          </p>
        </div>
      </div>

      <button type="button" onClick={claimDaily} className="btn-primary mt-6">
        Claim daily reward (+100)
      </button>

      <section className="glass-card mt-8 overflow-hidden">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="font-semibold">Transactions</h2>
        </div>
        <ul className="divide-y divide-border-subtle">
          {tx.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-xs text-text-muted">{t.type}</p>
              </div>
              <span
                className={cn(
                  'font-mono font-semibold',
                  t.amount >= 0 ? 'text-emerald-400' : 'text-text-secondary'
                )}
              >
                {t.amount >= 0 ? '+' : ''}
                {t.amount}
              </span>
            </li>
          ))}
        </ul>
        {tx.length === 0 && (
          <p className="py-12 text-center text-text-muted">No transactions yet</p>
        )}
      </section>
      <Link href="/prompt" className="mt-6 inline-block text-sm text-accent-blue hover:underline">
        ← Back to building
      </Link>
    </AppShell>
  )
}
