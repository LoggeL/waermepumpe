'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/eingabe', label: 'Eingabe', icon: '✏️' },
  { href: '/statistik', label: 'Statistik', icon: '📈' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2e3f] bg-[#0f1117]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-white">
          WP Dashboard
        </Link>
        <div className="flex gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-[#8b8fa3] hover:bg-[#1a1d27] hover:text-white'
              }`}
            >
              <span className="mr-1 hidden sm:inline">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
