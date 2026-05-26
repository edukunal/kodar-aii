'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/Navbar'
import { ProjectTypeModal } from '@/components/prompt/ProjectTypeModal'
import { Typewriter } from '@/components/prompt/Typewriter'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import {
  ArrowUp,
  Compass,
  History,
  Layers,
  Plus,
  Sparkles,
  Wand2,
} from 'lucide-react'

const MODELS = ['Claude Sonnet 4.5', 'Claude Sonnet 4.6', 'GPT-4o', 'Kodari Fast']

export default function PromptPage() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState(MODELS[0])
  const [typeLabel, setTypeLabel] = useState('Java Plugin')
  const [platform, setPlatform] = useState('minecraft_java')
  const [projectType, setProjectType] = useState('java_plugin')
  const [buildTool, setBuildTool] = useState('gradle')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const submit = async () => {
    if (!prompt.trim()) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    setLoading(true)
    try {
      const title =
        prompt.slice(0, 48).trim() + (prompt.length > 48 ? '…' : '') || 'New Project'
      const { session } = await api.createSession({
        title,
        prompt,
        projectType,
        platform,
        buildTool,
        model: model.toLowerCase().replace(/\s+/g, '-'),
      })
      router.push(`/session/${session.kodariId}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null

  return (
    <AppShell>
      <div className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center py-12 text-center">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Hi! I&apos;m Kodari :)</h1>
        <p className="mt-3 text-lg text-text-secondary">
          Let&apos;s turn your idea into <span className="text-accent-blue">reality.</span>
        </p>
        <div className="mt-10 w-full rounded-2xl border border-border-dim bg-bg-card/80 p-4 shadow-glow backdrop-blur-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ask Kodari to create a plugin that..."
            className="w-full resize-none bg-transparent text-left text-sm outline-none placeholder:text-text-muted"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="rounded-lg border border-border-dim p-2 text-text-muted hover:bg-white/5">
                <Plus className="h-4 w-4" />
              </button>
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="appearance-none rounded-full border border-border-soft bg-bg-input py-1.5 pl-8 pr-6 text-xs"
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <Sparkles className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-accent-blue" />
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border-soft px-3 py-1.5 text-xs hover:bg-white/5"
              >
                <Layers className="h-3.5 w-3.5" />
                {typeLabel}
              </button>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl border border-border-dim p-2 text-text-muted hover:bg-white/5">
                <Wand2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={submit}
                className="btn-primary flex h-9 w-9 items-center justify-center rounded-xl p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
          <Link href="/community" className="inline-flex items-center gap-2 hover:text-accent-blue">
            <Compass className="h-4 w-4" />
            Explore Community Plugins
          </Link>
          <Link href="/history" className="inline-flex items-center gap-2 hover:text-accent-blue">
            <History className="h-4 w-4" />
            Your Projects
          </Link>
        </div>
        <Typewriter />
      </div>
      <ProjectTypeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        platform={platform}
        projectType={projectType}
        buildTool={buildTool}
        onSelect={({ platform: p, projectType: t, buildTool: bt, label }) => {
          setPlatform(p)
          setProjectType(t)
          setBuildTool(bt)
          setTypeLabel(label)
        }}
      />
    </AppShell>
  )
}
