'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, type ProjectSession } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/Logo'
import {
  ChevronRight,
  FileCode,
  Folder,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react'

export function IdeWorkspace({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ProjectSession | null>(null)
  const [activePath, setActivePath] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const { session: s } = await api.getSession(sessionId)
    setSession(s)
    const files = s.files as { path: string; content: string }[]
    if (!activePath && files[0]) setActivePath(files[0].path)
  }, [sessionId, activePath])

  useEffect(() => {
    load()
  }, [load])

  const activeFile = session?.files.find((f) => f.path === activePath)

  const sendChat = async () => {
    if (!chatInput.trim() || !session) return
    setSending(true)
    try {
      const { session: updated } = await api.chatSession(session.kodariId, chatInput)
      setSession(updated)
      setChatInput('')
    } finally {
      setSending(false)
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  const files = (Array.isArray(session.files) ? session.files : []) as {
    path: string
    content: string
  }[]
  const messages = session.messages as { role: string; content: string }[]

  return (
    <div className="flex h-screen flex-col bg-bg-base text-sm">
      <header className="flex h-12 items-center justify-between border-b border-border-subtle px-4">
        <Logo />
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-text-muted">{session.kodariId}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-text-primary">{session.title}</span>
        </div>
        <Link href="/history" className="text-xs text-text-muted hover:text-accent-blue">
          Sessions
        </Link>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 border-r border-border-subtle bg-bg-card p-2">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase text-text-muted">Files</p>
          {files.map((f) => (
            <button
              key={f.path}
              type="button"
              onClick={() => setActivePath(f.path)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs',
                activePath === f.path ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-secondary hover:bg-white/5'
              )}
            >
              <FileCode className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{f.path.split('/').pop()}</span>
            </button>
          ))}
        </aside>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border-subtle bg-bg-elevated px-3 py-1.5">
            <Folder className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-mono text-xs text-text-muted">{activePath}</span>
          </div>
          <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-text-secondary">
            {activeFile?.content ?? '// Select a file'}
          </pre>
        </div>
        <aside className="flex w-80 shrink-0 flex-col border-l border-border-subtle bg-bg-card">
          <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
            <MessageSquare className="h-4 w-4 text-accent-blue" />
            <span className="font-medium">Kodari AI</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl px-3 py-2 text-xs leading-relaxed',
                  m.role === 'user' ? 'ml-4 bg-white/5' : 'mr-2 bg-accent-blue/10 text-text-secondary'
                )}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="border-t border-border-subtle p-2">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Ask Kodari to modify code..."
                className="input-base flex-1 py-2 text-xs"
              />
              <button type="button" onClick={sendChat} disabled={sending} className="btn-primary px-3">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
