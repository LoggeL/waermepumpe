'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Area,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
} from 'recharts'

interface Reading {
  date: string
  consumption_hp: number | null
  consumption_elec: number | null
  temp_min: number | null
  temp_max: number | null
}

interface MonthlySummary {
  year: number
  month: number
  kw_total: number
  avg_daily: number
  total_cost: number
  gas_comparison: number
}

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

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
  return `${parts[2]}.${parts[1]}.`
}

function getTodayFormatted(): string | null {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.`
}

export function ConsumptionTemperatureChart({ data }: { data: Reading[] }) {
  const chartData = data
    .filter(r => r.temp_max != null && r.consumption_hp != null)
    .map(r => ({
      date: formatDate(r.date),
      kWh: r.consumption_hp || 0,
      'Temp Max': r.temp_max,
      'Temp Min': r.temp_min,
    }))

  const todayLabel = getTodayFormatted()
  const hasToday = todayLabel && chartData.some(d => d.date === todayLabel)

  return (
    <div className="card">
      <h3
        className="mb-5 text-base font-bold"
        style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em', color: '#eef0f8' }}
      >
        Tagesverbrauch &amp; Temperatur
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="date" stroke={AXIS_COLOR} tick={TICK_STYLE} />
          <YAxis
            yAxisId="left"
            stroke={AXIS_COLOR}
            tick={TICK_STYLE}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#4a5670', fontSize: 10 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={AXIS_COLOR}
            tick={TICK_STYLE}
            label={{ value: '°C', angle: 90, position: 'insideRight', fill: '#4a5670', fontSize: 10 }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#6b7a96' }} />
          {hasToday && (
            <ReferenceLine
              x={todayLabel}
              yAxisId="left"
              stroke="rgba(245,158,11,0.4)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{ value: 'Heute', position: 'top', fill: '#f59e0b', fontSize: 10, fontWeight: 600 }}
            />
          )}
          <Bar yAxisId="left" dataKey="kWh" fill="#3b82f6" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="Temp Max" stroke="#f87171" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="Temp Min" stroke="#22d3ee" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyComparisonChart({ data }: { data: MonthlySummary[] }) {
  const chartData = data.map(m => ({
    month: `${MONTHS_DE[m.month - 1]} ${m.year}`,
    'Wärmepumpe': Math.round(m.total_cost * 100) / 100,
    'Gas (Vorjahr)': Math.round(m.gas_comparison * 100) / 100,
  }))

  return (
    <div className="card">
      <h3
        className="mb-5 text-base font-bold"
        style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em', color: '#eef0f8' }}
      >
        Kostenvergleich: Wärmepumpe vs. Gas
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey="month"
            stroke={AXIS_COLOR}
            tick={TICK_STYLE}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke={AXIS_COLOR} tick={TICK_STYLE} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number) => `${v.toFixed(2)} €`}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#6b7a96' }} />
          <Bar dataKey="Wärmepumpe" fill="#3b82f6" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gas (Vorjahr)" fill="#f97316" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CorrelationChart({ data }: { data: Reading[] }) {
  const chartData = data
    .filter(r => r.temp_min != null && r.consumption_hp != null)
    .map(r => ({
      temp: ((r.temp_max || 0) + (r.temp_min || 0)) / 2,
      kWh: r.consumption_hp || 0,
    }))

  return (
    <div className="card">
      <h3
        className="mb-5 text-base font-bold"
        style={{ fontFamily: 'var(--font-syne, system-ui)', letterSpacing: '-0.02em', color: '#eef0f8' }}
      >
        Korrelation: Temperatur vs. Verbrauch
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey="temp"
            name="Durchschnittstemp."
            unit="°C"
            stroke={AXIS_COLOR}
            tick={TICK_STYLE}
          />
          <YAxis
            dataKey="kWh"
            name="Verbrauch"
            unit=" kWh"
            stroke={AXIS_COLOR}
            tick={TICK_STYLE}
          />
          <ZAxis range={[45, 45]} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number, name: string) => [
              name === 'kWh' ? `${v} kWh` : `${v}°C`,
              name === 'kWh' ? 'Verbrauch' : 'Temperatur',
            ]}
          />
          <Scatter data={chartData} fill="#34d399" fillOpacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
