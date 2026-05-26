import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-input': 'var(--bg-input)',
        'accent-blue': 'var(--accent-blue)',
        'accent-purple': 'var(--accent-purple)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
        'border-subtle': 'var(--border-subtle)',
        'border-dim': 'var(--border-dim)',
        'border-soft': 'var(--border-soft)',
      },
      fontFamily: {
        display: ['var(--font-oxanium)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 60px rgba(80,144,255,0.15)',
        'glow-sm': '0 0 24px rgba(80,144,255,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
