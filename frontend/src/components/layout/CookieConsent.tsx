'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('kodari_cookies')) setVisible(true)
  }, [])

  if (!visible) return null

  const accept = (value: string) => {
    localStorage.setItem('kodari_cookies', value)
    setVisible(false)
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-border-dim',
        'bg-bg-elevated/95 p-4 shadow-float backdrop-blur-xl'
      )}
    >
      <p className="text-xs text-text-secondary">
        We use cookies for referral and ad tracking.{' '}
        <a href="#" className="text-accent-blue hover:underline">
          Learn more
        </a>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-ghost flex-1 py-1.5 text-xs" onClick={() => accept('declined')}>
          Decline
        </button>
        <button type="button" className="btn-ghost flex-1 py-1.5 text-xs" onClick={() => accept('accepted')}>
          Accept
        </button>
      </div>
    </div>
  )
}
