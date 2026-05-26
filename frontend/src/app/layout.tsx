import type { Metadata } from 'next'
import { Inter, Oxanium, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/lib/auth'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oxanium = Oxanium({ subsets: ['latin'], variable: '--font-oxanium' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Kodari — Build plugins, bots & more with AI',
  description: 'AI-powered creation platform for Minecraft, Discord, and extensions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.variable,
          oxanium.variable,
          jetbrains.variable,
          'min-h-screen bg-bg-base font-body text-text-primary antialiased'
        )}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
