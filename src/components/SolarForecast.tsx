'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Area, ReferenceLine,
} from 'recharts'

interface SolarData {
  date: string
  isToday: boolean
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

const GRID_COLOR = 'rgba(255,255,255,0.05)'
const AXIS_COLOR = 'rgba(255,255,255,0.18)'
const TICK_STYLE = { fill: '#4a5670', fontFamily: 'var(--font-mono, monospace)', fontSize: 10 }
const TOOLTIP_STYLE = {
  backgroundColor: '#0d1019',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#eef0f8',
  fontFamily: 'var(--font-outfit, system-ui)',
  fontSize: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}

function formatDate(d: string) {
  const parts = d.split('-')
  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

function getDateForOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

const DAY_LABELS = ['Heute', '+1', '+2', '+3', '+4', '+5']

export default function SolarForecast() {
  const [data, setData] = useState<SolarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState(0)

  const fetchSolar = useCallback((dayOffset: number) => {
    setLoading(true)
    setError('')
    const date = getDateForOffset(dayOffset)
    fetch(`/api/solar?date=${date}`)
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

  useEffect(() => {
    fetchSolar(0)
  }, [fetchSolar])

  function handleDayClick(offset: number) {
    setSelectedDay(offset)
    fetchSolar(offset)
  }

  const sunQuality = data
    ? data.sunshineHours >= 8
      ? { label: 'Sehr gut', color: '#fbbf24' }
      : data.sunshineHours >= 5
        ? { label: 'Gut', color: '#f59e0b' }
        : data.sunshineHours >= 2
          ? { label: 'Mäßig', color: '#f97316' }
          : { label: 'Gering', color: '#6b7a96' }
    : null

  const hourlyChart = data
    ? data.hourly.hours
        .map((h, i) => ({
          hour: h,
          'Strahlung W/m²': data.hourly.directRadiation[i],
          'Bewölkung %': data.hourly.cloudCover[i],
        }))
        .slice(6, 21)
    : []

  const currentHourLabel = data?.isToday ? `${new Date().getHours()}:00` : null

  return (
    <div className="card space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-base font-bold text-white"
            style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em' }}
          >
            Sonnenprognose
          </h3>
          {data && (
            <p className="section-label mt-0.5">{formatDate(data.date)}</p>
          )}
        </div>
        {sunQuality && (
          <span
            className="rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{
              color: sunQuality.color,
              background: `${sunQuality.color}18`,
              border: `1px solid ${sunQuality.color}35`,
              letterSpacing: '0.04em',
            }}
          >
            {sunQuality.label}
          </span>
        )}
      </div>

      {/* Day selector */}
      <div className="flex gap-2">
        {DAY_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => handleDayClick(i)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={
              selectedDay === i
                ? {
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    color: '#fbbf24',
                    boxShadow: '0 0 12px rgba(245,158,11,0.08)',
                  }
                : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: '#6b7a96',
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="spinner-amber h-6 w-6" />
          <p className="section-label">Prognose wird geladen…</p>
        </div>
      )}

      {!loading && error && (
        <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
      )}

      {!loading && !error && data && (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Sonnenstunden', value: `${data.sunshineHours}h`, color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)' },
              { label: 'Strahlung', value: `${data.radiationSum}`, unit: 'MJ/m²', color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.18)' },
              { label: 'Bewölkung', value: `${data.avgCloudCover}%`, color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.18)' },
              { label: 'Solar-Ertrag (gesch.)', value: `${data.estimatedYieldKwh}`, unit: 'kWh', color: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.18)' },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: m.bg, border: `1px solid ${m.border}` }}
              >
                <p className="section-label mb-2">{m.label}</p>
                <p className="stat-value text-xl font-bold" style={{ color: m.color }}>
                  {m.value}
                  {m.unit && <span className="text-xs font-normal opacity-60 ml-1">{m.unit}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Hourly chart */}
          <div>
            <p className="section-label mb-3">Stundenverlauf — Strahlung &amp; Bewölkung</p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={hourlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="hour" stroke={AXIS_COLOR} tick={TICK_STYLE} />
                <YAxis
                  yAxisId="left"
                  stroke={AXIS_COLOR}
                  tick={TICK_STYLE}
                  label={{ value: 'W/m²', angle: -90, position: 'insideLeft', fill: '#4a5670', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  stroke={AXIS_COLOR}
                  tick={TICK_STYLE}
                  label={{ value: '%', angle: 90, position: 'insideRight', fill: '#4a5670', fontSize: 10 }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                {currentHourLabel && (
                  <ReferenceLine
                    x={currentHourLabel}
                    yAxisId="left"
                    stroke="rgba(249,115,22,0.6)"
                    strokeWidth={2}
                    label={{ value: 'Jetzt', position: 'top', fill: '#f97316', fontSize: 10, fontWeight: 700 }}
                  />
                )}
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="Bewölkung %"
                  fill="#3b82f6"
                  fillOpacity={0.12}
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeOpacity={0.7}
                />
                <Bar
                  yAxisId="left"
                  dataKey="Strahlung W/m²"
                  fill="#f59e0b"
                  fillOpacity={0.8}
                  radius={[3, 3, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Footer details */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Spitze', value: `${data.peakRadiation} W/m²` },
              { label: 'UV-Index max', value: `${data.uvMax}` },
              { label: 'Standort', value: 'Kindenheim' },
            ].map((item, i) => (
              <div key={i} className="flex items-baseline gap-1.5">
                <span className="section-label">{item.label}</span>
                <span className="stat-value text-xs font-medium" style={{ color: '#8892a4' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
