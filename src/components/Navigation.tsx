'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faPenToSquare, faChartBar } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const links: { href: string; label: string; icon: IconDefinition }[] = [
  { href: '/', label: 'Dashboard', icon: faChartLine },
  { href: '/eingabe', label: 'Eingabe', icon: faPenToSquare },
  { href: '/statistik', label: 'Statistik', icon: faChartBar },
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
              <FontAwesomeIcon icon={link.icon} className="mr-1.5 hidden w-3.5 sm:inline-block" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
