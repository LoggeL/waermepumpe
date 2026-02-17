'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'

interface MonthlySummary {
  year: number
  month: number
  kw_total: number
  avg_daily: number
  total_cost: number
  gas_comparison: number
}

interface StatsData {
  currentMonth: {
    kw: number
    cost: number
    avgDaily: number
  }
  pricePerKwh: number
  monthlySummaries: MonthlySummary[]
  yearlyStats: Array<{
    year: string
    total_kwh: number
    avg_daily: number
    days: number
  }>
}

const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

export default function StatistikPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="spinner-amber h-8 w-8" />
            <p className="section-label">Laden…</p>
          </div>
        </main>
      </>
    )
  }

  if (!stats) return null

  const totalHpCost = stats.monthlySummaries.reduce((s, m) => s + m.total_cost, 0)
  const totalGasCost = stats.monthlySummaries.reduce((s, m) => s + m.gas_comparison, 0)
  const totalKwh = stats.monthlySummaries.reduce((s, m) => s + m.kw_total, 0)
  const savings = totalGasCost - totalHpCost
  const monthsWithData = stats.monthlySummaries.length
  const projectedAnnual = monthsWithData > 0 ? (totalHpCost / monthsWithData) * 12 : 0

  const summaryCards = [
    { label: 'Gesamt kWh', value: `${Math.round(totalKwh)}`, accent: '#3b82f6', color: 'text-blue-400' },
    { label: 'WP-Kosten gesamt', value: `${totalHpCost.toFixed(0)} €`, accent: '#3b82f6', color: 'text-blue-400' },
    { label: 'Gas-Kosten (Vergleich)', value: `${totalGasCost.toFixed(0)} €`, accent: '#f97316', color: 'text-orange-400' },
    {
      label: 'Ersparnis',
      value: `${savings > 0 ? '+' : ''}${savings.toFixed(0)} €`,
      accent: savings > 0 ? '#34d399' : '#f87171',
      color: savings > 0 ? 'text-emerald-400' : 'text-red-400',
    },
  ]

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="page-title">Statistik</h1>
          <p className="section-label mt-1">Auswertung & Vergleich</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryCards.map((c, i) => (
            <div
              key={i}
              className={`card anim-${i + 1}`}
              style={{ '--accent': c.accent } as React.CSSProperties}
            >
              <p className="section-label mb-3">{c.label}</p>
              <p className={`stat-value text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Price & projection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card" style={{ '--accent': '#6366f1' } as React.CSSProperties}>
            <p className="section-label mb-3">Strompreis</p>
            <p className="stat-value text-xl font-bold text-indigo-400">{stats.pricePerKwh.toFixed(4)} €/kWh</p>
          </div>
          <div className="card" style={{ '--accent': '#f59e0b' } as React.CSSProperties}>
            <p className="section-label mb-3">Hochrechnung (Jahr)</p>
            <p className="stat-value text-xl font-bold text-amber-400">{projectedAnnual.toFixed(0)} €</p>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="card overflow-x-auto">
          <h2
            className="mb-5 text-base font-bold"
            style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em', color: '#eef0f8' }}
          >
            Monatsübersicht
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                {['Monat', 'kWh', 'Ø/Tag', 'WP-Kosten', 'Gas-Kosten', 'Differenz'].map(h => (
                  <th
                    key={h}
                    className={`pb-3 text-xs font-semibold ${h !== 'Monat' ? 'text-right' : 'text-left'} pr-4 last:pr-0`}
                    style={{ color: '#4a5670', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.monthlySummaries.map((m, i) => {
                const diff = m.gas_comparison - m.total_cost
                return (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="py-3 pr-4 text-xs" style={{ color: '#8892a4' }}>
                      {MONTHS_DE[m.month - 1]} {m.year}
                    </td>
                    <td className="stat-value py-3 pr-4 text-right text-xs">{Math.round(m.kw_total)}</td>
                    <td className="stat-value py-3 pr-4 text-right text-xs" style={{ color: '#8892a4' }}>
                      {typeof m.avg_daily === 'number' && m.avg_daily < 100
                        ? m.avg_daily.toFixed(1)
                        : '–'}
                    </td>
                    <td className="stat-value py-3 pr-4 text-right text-xs text-blue-400">{m.total_cost.toFixed(2)} €</td>
                    <td className="stat-value py-3 pr-4 text-right text-xs text-orange-400">{m.gas_comparison.toFixed(2)} €</td>
                    <td className={`stat-value py-3 text-right text-xs font-semibold ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)} €
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}>
                <td className="pt-3 pr-4 text-xs font-semibold" style={{ color: '#8892a4' }}>Gesamt</td>
                <td className="stat-value pt-3 pr-4 text-right text-xs font-semibold">{Math.round(totalKwh)}</td>
                <td className="pt-3 pr-4 text-right text-xs" style={{ color: '#4a5670' }}>–</td>
                <td className="stat-value pt-3 pr-4 text-right text-xs font-semibold text-blue-400">{totalHpCost.toFixed(2)} €</td>
                <td className="stat-value pt-3 pr-4 text-right text-xs font-semibold text-orange-400">{totalGasCost.toFixed(2)} €</td>
                <td className={`stat-value pt-3 text-right text-xs font-semibold ${savings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {savings > 0 ? '+' : ''}{savings.toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Yearly stats */}
        {stats.yearlyStats && stats.yearlyStats.length > 0 && (
          <div className="card">
            <h2
              className="mb-5 text-base font-bold"
              style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em', color: '#eef0f8' }}
            >
              Jahresvergleich
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.yearlyStats.map((y, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <p
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em' }}
                  >
                    {y.year}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: '#6b7a96' }}>
                    {Math.round(y.total_kwh)} kWh in {y.days} Tagen
                  </p>
                  <p className="text-xs" style={{ color: '#6b7a96' }}>
                    Ø {y.avg_daily.toFixed(1)} kWh/Tag
                  </p>
                  <p className="stat-value mt-2 text-sm font-semibold text-blue-400">
                    {(y.total_kwh * stats.pricePerKwh).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </>
  )
}
