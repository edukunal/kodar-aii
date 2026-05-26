import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-text-muted">
      <div className="flex flex-wrap gap-4">
        {['Terms', 'Privacy', 'Cookie Preferences', 'Discord'].map((item) => (
          <Link key={item} href="#" className="hover:text-text-secondary">
            {item}
          </Link>
        ))}
      </div>
      <p>© 2026 Kodari</p>
    </footer>
  )
}
