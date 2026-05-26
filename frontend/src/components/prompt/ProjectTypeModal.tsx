'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import {
  Blocks,
  Chrome,
  Code2,
  MessageSquare,
  Pickaxe,
  X,
} from 'lucide-react'

const PLATFORMS = [
  { id: 'minecraft_java', label: 'Minecraft Java', icon: Pickaxe },
  { id: 'hytale', label: 'Hytale', icon: Blocks },
  { id: 'discord', label: 'Discord', icon: MessageSquare },
  { id: 'chrome', label: 'Chrome Extensions', icon: Chrome },
]

const TABS = ['Plugins', 'Mods', 'Config', 'Scripting'] as const

const TYPES: Record<string, { id: string; label: string; buildTools?: string[] }[]> = {
  Plugins: [
    { id: 'java_plugin', label: 'Java Plugin', buildTools: ['gradle', 'maven'] },
    { id: 'velocity_plugin', label: 'Velocity Plugin' },
    { id: 'discord_bot', label: 'Discord Bot (JS)' },
  ],
  Mods: [
    { id: 'fabric_mod', label: 'Fabric Mod' },
    { id: 'forge_mod', label: 'Forge Mod' },
  ],
  Config: [{ id: 'config_pack', label: 'Config / Datapack' }],
  Scripting: [{ id: 'skript', label: 'Skript' }],
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  platform: string
  projectType: string
  buildTool: string
  onSelect: (p: { platform: string; projectType: string; buildTool: string; label: string }) => void
}

export function ProjectTypeModal({
  open,
  onOpenChange,
  platform,
  projectType,
  buildTool,
  onSelect,
}: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Plugins')
  const [plat, setPlat] = useState(platform)
  const [tool, setTool] = useState(buildTool)

  const types = TYPES[tab] ?? []
  const selected = types.find((t) => t.id === projectType) ?? types[0]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(720px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border-dim bg-bg-elevated shadow-float">
          <aside className="w-44 shrink-0 border-r border-border-subtle bg-bg-card p-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Platform
            </p>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlat(p.id)}
                className={cn(
                  'mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs',
                  plat === p.id ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-secondary hover:bg-white/5'
                )}
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
              </button>
            ))}
          </aside>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div className="flex gap-1">
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium',
                      tab === t ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Dialog.Close className="rounded-lg p-1 text-text-muted hover:bg-white/5">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            <div className="grid flex-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelect({
                      platform: plat,
                      projectType: t.id,
                      buildTool: tool,
                      label: t.label,
                    })
                    onOpenChange(false)
                  }}
                  className={cn(
                    'rounded-xl border p-4 text-left transition',
                    selected?.id === t.id
                      ? 'border-accent-blue/50 bg-accent-blue/10 shadow-glow-sm'
                      : 'border-border-dim hover:border-border-soft'
                  )}
                >
                  <Code2 className="mb-2 h-5 w-5 text-accent-blue" />
                  <p className="font-medium text-sm">{t.label}</p>
                  {t.buildTools && (
                    <div className="mt-2 flex gap-1">
                      {t.buildTools.map((bt) => (
                        <span
                          key={bt}
                          onClick={(e) => {
                            e.stopPropagation()
                            setTool(bt)
                          }}
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] uppercase',
                            tool === bt ? 'bg-accent-blue text-white' : 'bg-white/5 text-text-muted'
                          )}
                        >
                          {bt}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
