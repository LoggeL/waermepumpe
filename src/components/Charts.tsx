'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Area,
  ScatterChart, Scatter, ZAxis,
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

function formatDate(d: string) {
  const parts = d.split('-')
  return `${parts[2]}.${parts[1]}.`
}

export function ConsumptionChart({ data }: { data: Reading[] }) {
  const chartData = data.map(r => ({
    date: formatDate(r.date),
    kWh: r.consumption_hp || 0,
  }))

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-medium text-[#8b8fa3]">Tagesverbrauch (kWh)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
          <XAxis dataKey="date" stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} />
          <YAxis stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2e3f', borderRadius: '8px', color: '#e4e6ed' }}
          />
          <Line
            type="monotone" dataKey="kWh" stroke="#3b82f6"
            strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }}
          />
        </LineChart>
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
      <h3 className="mb-4 text-sm font-medium text-[#8b8fa3]">Kostenvergleich: Wärmepumpe vs. Gas</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
          <XAxis dataKey="month" stroke="#555" fontSize={10} tick={{ fill: '#8b8fa3' }} angle={-45} textAnchor="end" height={60} />
          <YAxis stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2e3f', borderRadius: '8px', color: '#e4e6ed' }}
            formatter={(v: number) => `${v.toFixed(2)} €`}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Wärmepumpe" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gas (Vorjahr)" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TemperatureChart({ data }: { data: Reading[] }) {
  const chartData = data
    .filter(r => r.temp_max != null && r.consumption_hp != null)
    .map(r => ({
      date: formatDate(r.date),
      kWh: r.consumption_hp || 0,
      'Temp Max': r.temp_max,
      'Temp Min': r.temp_min,
    }))

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-medium text-[#8b8fa3]">Verbrauch & Temperatur</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
          <XAxis dataKey="date" stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} />
          <YAxis yAxisId="left" stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#8b8fa3', fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} label={{ value: '°C', angle: 90, position: 'insideRight', fill: '#8b8fa3', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2e3f', borderRadius: '8px', color: '#e4e6ed' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar yAxisId="left" dataKey="kWh" fill="#3b82f6" opacity={0.7} radius={[2, 2, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="Temp Max" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="Temp Min" stroke="#06b6d4" strokeWidth={2} dot={false} />
        </ComposedChart>
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
      <h3 className="mb-4 text-sm font-medium text-[#8b8fa3]">Korrelation: Temperatur vs. Verbrauch</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
          <XAxis dataKey="temp" name="Durchschnittstemp." unit="°C" stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} />
          <YAxis dataKey="kWh" name="Verbrauch" unit=" kWh" stroke="#555" fontSize={11} tick={{ fill: '#8b8fa3' }} />
          <ZAxis range={[40, 40]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2e3f', borderRadius: '8px', color: '#e4e6ed' }}
            formatter={(v: number, name: string) => [name === 'kWh' ? `${v} kWh` : `${v}°C`, name === 'kWh' ? 'Verbrauch' : 'Temperatur']}
          />
          <Scatter data={chartData} fill="#22c55e" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
