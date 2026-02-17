'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Area,
} from 'recharts'

interface SolarData {
  date: string
  sunshineHours: number
  radiationSum: number
  uvMax: number
  avgCloudCover: number
  peakRadiation: number
  estimatedYieldKwh: number
  hourly: {
    hours: string[]
    cloudCover: number[]
    directRadiation: number[]
  }
}

function formatDate(d: string) {
  const parts = d.split('-')
  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

export default function SolarForecast() {
  const [data, setData] = useState<SolarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/solar')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error)
        } else {
          setData(d)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Verbindungsfehler')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="card">
        <h3 className="mb-4 text-sm font-medium text-[#8b8fa3]">Sonnenprognose morgen</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card">
        <h3 className="mb-4 text-sm font-medium text-[#8b8fa3]">Sonnenprognose morgen</h3>
        <p className="text-sm text-red-400">{error || 'Keine Daten'}</p>
      </div>
    )
  }

  // Build hourly chart data (daytime hours only: 6-20)
  const hourlyChart = data.hourly.hours
    .map((h, i) => ({
      hour: h,
      'Strahlung W/m²': data.hourly.directRadiation[i],
      'Bewölkung %': data.hourly.cloudCover[i],
    }))
    .slice(6, 21) // 6:00 to 20:00

  // Sunshine quality indicator
  const sunQuality = data.sunshineHours >= 8
    ? { label: 'Sehr gut', color: 'text-yellow-400' }
    : data.sunshineHours >= 5
      ? { label: 'Gut', color: 'text-yellow-500' }
      : data.sunshineHours >= 2
        ? { label: 'Mäßig', color: 'text-orange-400' }
        : { label: 'Gering', color: 'text-gray-400' }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#8b8fa3]">
          Sonnenprognose morgen ({formatDate(data.date)})
        </h3>
        <span className={`text-xs font-medium ${sunQuality.color}`}>
          {sunQuality.label}
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#2a2e3f] bg-[#0f1117] p-3">
          <p className="text-xs text-[#8b8fa3]">Sonnenstunden</p>
          <p className="text-xl font-bold text-yellow-400">{data.sunshineHours}h</p>
        </div>
        <div className="rounded-lg border border-[#2a2e3f] bg-[#0f1117] p-3">
          <p className="text-xs text-[#8b8fa3]">Strahlung</p>
          <p className="text-xl font-bold text-orange-400">{data.radiationSum} <span className="text-xs font-normal">MJ/m²</span></p>
        </div>
        <div className="rounded-lg border border-[#2a2e3f] bg-[#0f1117] p-3">
          <p className="text-xs text-[#8b8fa3]">Bewölkung (tags)</p>
          <p className="text-xl font-bold text-blue-300">{data.avgCloudCover}%</p>
        </div>
        <div className="rounded-lg border border-[#2a2e3f] bg-[#0f1117] p-3">
          <p className="text-xs text-[#8b8fa3]">Solar-Ertrag (gesch.)</p>
          <p className="text-xl font-bold text-green-400">{data.estimatedYieldKwh} <span className="text-xs font-normal">kWh</span></p>
        </div>
      </div>

      {/* Hourly chart */}
      <div>
        <p className="mb-2 text-xs text-[#8b8fa3]">Stundenverlauf (Strahlung & Bewölkung)</p>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={hourlyChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
            <XAxis dataKey="hour" stroke="#555" fontSize={10} tick={{ fill: '#8b8fa3' }} />
            <YAxis
              yAxisId="left"
              stroke="#555"
              fontSize={10}
              tick={{ fill: '#8b8fa3' }}
              label={{ value: 'W/m²', angle: -90, position: 'insideLeft', fill: '#8b8fa3', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              stroke="#555"
              fontSize={10}
              tick={{ fill: '#8b8fa3' }}
              label={{ value: '%', angle: 90, position: 'insideRight', fill: '#8b8fa3', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2e3f', borderRadius: '8px', color: '#e4e6ed' }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="Bewölkung %"
              fill="#3b82f6"
              fillOpacity={0.15}
              stroke="#3b82f6"
              strokeWidth={1}
            />
            <Bar
              yAxisId="left"
              dataKey="Strahlung W/m²"
              fill="#f59e0b"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Extra details */}
      <div className="flex gap-4 text-xs text-[#8b8fa3]">
        <span>Spitze: {data.peakRadiation} W/m²</span>
        <span>UV-Index max: {data.uvMax}</span>
        <span>Standort: Ramsen</span>
      </div>
    </div>
  )
}
