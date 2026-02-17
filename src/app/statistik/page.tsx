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
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
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

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <h1 className="text-xl font-bold">Statistik</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card">
            <p className="text-xs text-[#8b8fa3]">Gesamt kWh</p>
            <p className="text-xl font-bold text-blue-400">{Math.round(totalKwh)}</p>
          </div>
          <div className="card">
            <p className="text-xs text-[#8b8fa3]">Gesamt WP-Kosten</p>
            <p className="text-xl font-bold text-blue-400">{totalHpCost.toFixed(0)} €</p>
          </div>
          <div className="card">
            <p className="text-xs text-[#8b8fa3]">Gas-Kosten (Vergleich)</p>
            <p className="text-xl font-bold text-orange-400">{totalGasCost.toFixed(0)} €</p>
          </div>
          <div className="card">
            <p className="text-xs text-[#8b8fa3]">Ersparnis</p>
            <p className={`text-xl font-bold ${savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {savings > 0 ? '+' : ''}{savings.toFixed(0)} €
            </p>
          </div>
        </div>

        {/* Price and projection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-[#8b8fa3]">Strompreis</p>
            <p className="text-lg font-bold text-white">{stats.pricePerKwh.toFixed(4)} €/kWh</p>
          </div>
          <div className="card">
            <p className="text-xs text-[#8b8fa3]">Hochrechnung (Jahr)</p>
            <p className="text-lg font-bold text-yellow-400">{projectedAnnual.toFixed(0)} €</p>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="card overflow-x-auto">
          <h2 className="mb-3 text-sm font-medium text-[#8b8fa3]">Monatsübersicht</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2e3f] text-left text-xs text-[#8b8fa3]">
                <th className="pb-2 pr-3">Monat</th>
                <th className="pb-2 pr-3 text-right">kWh</th>
                <th className="pb-2 pr-3 text-right">Ø/Tag</th>
                <th className="pb-2 pr-3 text-right">WP-Kosten</th>
                <th className="pb-2 pr-3 text-right">Gas-Kosten</th>
                <th className="pb-2 text-right">Differenz</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlySummaries.map((m, i) => {
                const diff = m.gas_comparison - m.total_cost
                return (
                  <tr key={i} className="border-b border-[#2a2e3f]/50 hover:bg-[#1e2130]">
                    <td className="py-2 pr-3 text-xs">
                      {MONTHS_DE[m.month - 1]} {m.year}
                    </td>
                    <td className="py-2 pr-3 text-right">{Math.round(m.kw_total)}</td>
                    <td className="py-2 pr-3 text-right">
                      {typeof m.avg_daily === 'number' && m.avg_daily < 100
                        ? m.avg_daily.toFixed(1)
                        : '–'}
                    </td>
                    <td className="py-2 pr-3 text-right text-blue-400">{m.total_cost.toFixed(2)} €</td>
                    <td className="py-2 pr-3 text-right text-orange-400">{m.gas_comparison.toFixed(2)} €</td>
                    <td className={`py-2 text-right font-medium ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)} €
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#3b82f6]/30 font-medium">
                <td className="pt-2 pr-3 text-xs">Gesamt</td>
                <td className="pt-2 pr-3 text-right">{Math.round(totalKwh)}</td>
                <td className="pt-2 pr-3 text-right">–</td>
                <td className="pt-2 pr-3 text-right text-blue-400">{totalHpCost.toFixed(2)} €</td>
                <td className="pt-2 pr-3 text-right text-orange-400">{totalGasCost.toFixed(2)} €</td>
                <td className={`pt-2 text-right ${savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {savings > 0 ? '+' : ''}{savings.toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Yearly stats */}
        {stats.yearlyStats && stats.yearlyStats.length > 0 && (
          <div className="card">
            <h2 className="mb-3 text-sm font-medium text-[#8b8fa3]">Jahresvergleich</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.yearlyStats.map((y, i) => (
                <div key={i} className="rounded-lg border border-[#2a2e3f] p-3">
                  <p className="text-lg font-bold">{y.year}</p>
                  <p className="text-sm text-[#8b8fa3]">
                    {Math.round(y.total_kwh)} kWh in {y.days} Tagen
                  </p>
                  <p className="text-sm text-[#8b8fa3]">
                    Ø {y.avg_daily.toFixed(1)} kWh/Tag
                  </p>
                  <p className="text-sm text-blue-400">
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
