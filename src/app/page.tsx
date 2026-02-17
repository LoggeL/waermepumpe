'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import DashboardCards from '@/components/DashboardCards'
import SolarForecast from '@/components/SolarForecast'
import { ConsumptionChart, MonthlyComparisonChart, TemperatureChart, CorrelationChart } from '@/components/Charts'

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
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        </main>
      </>
    )
  }

  if (!stats) return null

  const cards = [
    {
      label: 'Monat kWh',
      value: `${stats.currentMonth.kw}`,
      sub: `${stats.currentMonth.days} Tage`,
      color: stats.currentMonth.kw > 500 ? 'text-orange-400' : 'text-blue-400',
    },
    {
      label: 'Kosten (Monat)',
      value: `${stats.currentMonth.cost.toFixed(0)} €`,
      sub: `${stats.pricePerKwh.toFixed(4)} €/kWh`,
      color: stats.currentMonth.cost > 200 ? 'text-red-400' : 'text-green-400',
    },
    {
      label: 'Ø Tagesverbrauch',
      value: `${stats.currentMonth.avgDaily} kWh`,
      sub: 'aktueller Monat',
      color: stats.currentMonth.avgDaily > 25 ? 'text-orange-400' : 'text-green-400',
    },
    {
      label: 'Ø Temperatur',
      value: stats.currentMonth.avgTemp != null ? `${stats.currentMonth.avgTemp}°C` : '–',
      sub: 'Durchschnitt',
      color: (stats.currentMonth.avgTemp ?? 0) < 0 ? 'text-cyan-400' : 'text-yellow-400',
    },
  ]

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <h1 className="text-xl font-bold">Übersicht</h1>
        <DashboardCards cards={cards} />

        <SolarForecast />

        <ConsumptionChart data={stats.allReadings} />

        <div className="grid gap-4 lg:grid-cols-2">
          <TemperatureChart data={stats.allReadings} />
          <CorrelationChart data={stats.allReadings} />
        </div>

        <MonthlyComparisonChart data={stats.monthlySummaries} />
      </main>
    </>
  )
}
