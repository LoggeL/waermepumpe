'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
    } else {
      setError('Falsches Passwort')
    }
    setLoading(false)
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: '#06080d',
        backgroundImage:
          'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(245,158,11,0.09) 0%, transparent 65%), radial-gradient(ellipse 50% 30% at 80% 90%, rgba(34,211,238,0.03) 0%, transparent 60%)',
      }}
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="card animate-fade-in relative w-full max-w-sm space-y-6"
        style={{ '--accent': '#f59e0b' } as React.CSSProperties}
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 pb-1">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
              boxShadow: '0 0 36px rgba(245,158,11,0.32), 0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            <FontAwesomeIcon icon={faBolt} className="w-6 text-black/80" />
          </div>
          <div className="text-center">
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.025em' }}
            >
              Wärmepumpe
            </h1>
            <p className="section-label mt-1">Monitoring Dashboard</p>
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-center text-sm"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label className="section-label mb-2 block">Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-dark"
            placeholder="••••••••"
            autoFocus
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  )
}
