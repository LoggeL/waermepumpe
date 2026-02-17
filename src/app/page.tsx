'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import DashboardCards from '@/components/DashboardCards'
import SolarForecast from '@/components/SolarForecast'
import { ConsumptionTemperatureChart, MonthlyComparisonChart, CorrelationChart } from '@/components/Charts'

interface StatsData {
  currentMonth: {
    kw: number
    cost: number
    avgDaily: number
    avgTemp: number | null
    days: number
  }
  pricePerKwh: number
  allReadings: Array<{
    date: string
    consumption_hp: number | null
    consumption_elec: number | null
    temp_min: number | null
    temp_max: number | null
  }>
  monthlySummaries: Array<{
    year: number
    month: number
    kw_total: number
    avg_daily: number
    total_cost: number
    gas_comparison: number
  }>
  lastReading: {
    date: string
    meter_hp: number
    meter_elec: number
  } | null
}

export default function DashboardPage() {
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

  const avgTemp = stats.currentMonth.avgTemp ?? 0

  const cards = [
    {
      label: 'Monat kWh',
      value: `${stats.currentMonth.kw}`,
      sub: `${stats.currentMonth.days} Tage`,
      color: stats.currentMonth.kw > 500 ? 'text-orange-400' : 'text-blue-400',
      accent: stats.currentMonth.kw > 500 ? '#f97316' : '#3b82f6',
    },
    {
      label: 'Kosten (Monat)',
      value: `${stats.currentMonth.cost.toFixed(0)} €`,
      sub: `${stats.pricePerKwh.toFixed(4)} €/kWh`,
      color: stats.currentMonth.cost > 200 ? 'text-red-400' : 'text-emerald-400',
      accent: stats.currentMonth.cost > 200 ? '#f87171' : '#34d399',
    },
    {
      label: 'Ø Tagesverbrauch',
      value: `${stats.currentMonth.avgDaily} kWh`,
      sub: 'aktueller Monat',
      color: stats.currentMonth.avgDaily > 25 ? 'text-orange-400' : 'text-emerald-400',
      accent: stats.currentMonth.avgDaily > 25 ? '#f97316' : '#34d399',
    },
    {
      label: 'Ø Temperatur',
      value: stats.currentMonth.avgTemp != null ? `${stats.currentMonth.avgTemp}°C` : '–',
      sub: 'Durchschnitt',
      color: avgTemp < 0 ? 'text-cyan-400' : 'text-amber-400',
      accent: avgTemp < 0 ? '#22d3ee' : '#f59e0b',
    },
  ]

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">

        {/* Page header */}
        <div className="animate-fade-in flex items-end justify-between">
          <div>
            <h1 className="page-title">Übersicht</h1>
            <p className="section-label mt-1">Energiemonitoring</p>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <span className="live-dot" />
            <span className="section-label">Live</span>
          </div>
        </div>

        <DashboardCards cards={cards} />

        <SolarForecast />

        <ConsumptionTemperatureChart data={stats.allReadings} />

        <CorrelationChart data={stats.allReadings} />

        <MonthlyComparisonChart data={stats.monthlySummaries} />

      </main>
    </>
  )
}
