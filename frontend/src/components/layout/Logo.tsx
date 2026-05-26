import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <Image
        src="https://kodari.ai/current_icon_no_bg.png"
        alt="Kodari"
        width={28}
        height={28}
        className="h-7 w-7"
      />
      <span className="font-display text-sm font-bold tracking-widest">KODARI</span>
    </Link>
  )
}
