'use client'

import { useEffect, useState } from 'react'

const PHRASES = [
  'Create Minecraft plugins with AI',
  'Build Discord bots in minutes',
  'Generate Fabric mods effortlessly',
  'Ship Chrome extensions faster',
]

export function Typewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[phraseIndex]
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          const next = phrase.slice(0, text.length + 1)
          setText(next)
          if (next === phrase) {
            setTimeout(() => setDeleting(true), 2000)
          }
        } else {
          const next = phrase.slice(0, text.length - 1)
          setText(next)
          if (next === '') {
            setDeleting(false)
            setPhraseIndex((i) => (i + 1) % PHRASES.length)
          }
        }
      },
      deleting ? 40 : 80
    )
    return () => clearTimeout(timeout)
  }, [text, deleting, phraseIndex])

  return (
    <p className="mt-16 text-center text-sm text-text-muted">
      <span>{text}</span>
      <span className="text-accent-blue">|</span>
    </p>
  )
}
