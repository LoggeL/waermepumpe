'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">WP Dashboard</h1>
          <p className="mt-1 text-sm text-[#8b8fa3]">Wärmepumpe Monitoring</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-[#8b8fa3]">Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-dark"
            placeholder="Passwort eingeben"
            autoFocus
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>
    </div>
  )
}
