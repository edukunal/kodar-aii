'use client'

import Link from 'next/link'
import { Star, Zap, Clock, Puzzle, Bot } from 'lucide-react'
import type { ProjectSession } from '@/lib/api'
import { cn, formatTokens, timeAgo } from '@/lib/utils'

export function SessionCard({
  session,
  onFavorite,
}: {
  session: ProjectSession
  onFavorite?: (id: string, value: boolean) => void
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border-dim bg-bg-card transition hover:border-accent-blue/30 hover:shadow-glow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onFavorite?.(session.id, !session.isFavorite)}
          className={cn('rounded p-1', session.isFavorite && 'text-amber-400')}
        >
          <Star className="h-3.5 w-3.5" fill={session.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <Link href={`/session/${session.kodariId}`}>
        <div className="aspect-video bg-gradient-to-br from-accent-blue/20 via-bg-elevated to-accent-purple/20" />
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold">{session.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-blue/15 px-2 py-0.5 text-[10px] text-accent-blue">
              <Puzzle className="h-3 w-3" />
              Plugin
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-purple/15 px-2 py-0.5 text-[10px] text-accent-purple">
              <Bot className="h-3 w-3" />
              {session.model}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              {formatTokens(session.tokensUsed)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(session.updatedAt)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
