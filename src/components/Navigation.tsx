'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faPenToSquare, faChartBar, faBolt } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const links: { href: string; label: string; icon: IconDefinition }[] = [
  { href: '/', label: 'Dashboard', icon: faChartLine },
  { href: '/eingabe', label: 'Eingabe', icon: faPenToSquare },
  { href: '/statistik', label: 'Statistik', icon: faChartBar },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(6, 8, 13, 0.88)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Brand mark */}
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
              boxShadow: '0 0 18px rgba(245,158,11,0.28), 0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <FontAwesomeIcon icon={faBolt} className="w-3.5 text-black/80" />
          </div>
          <div className="leading-none">
            <span
              className="block text-sm font-bold text-white"
              style={{
                fontFamily: 'var(--font-syne, system-ui)',
                letterSpacing: '-0.02em',
              }}
            >
              Wärmepumpe
            </span>
            <span
              className="block text-[9px] font-semibold uppercase"
              style={{ letterSpacing: '0.14em', color: 'rgba(245,158,11,0.5)' }}
            >
              Dashboard
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: 'rgba(245,158,11,0.09)',
                        border: '1px solid rgba(245,158,11,0.22)',
                        color: '#fbbf24',
                        boxShadow: '0 0 14px rgba(245,158,11,0.07)',
                      }
                    : {
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: '#6b7a96',
                      }
                }
              >
                <FontAwesomeIcon icon={link.icon} className="w-3 flex-shrink-0" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            )
          })}
        </div>

      </div>
    </nav>
  )
}
