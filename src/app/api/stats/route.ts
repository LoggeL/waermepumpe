import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getDb()

  // Current month stats
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthReadings = db.prepare(`
    SELECT * FROM daily_readings WHERE date LIKE ? ORDER BY date ASC
  `).all(`${currentMonth}%`) as Array<{
    date: string; meter_hp: number; meter_elec: number;
    consumption_hp: number | null; consumption_elec: number | null;
    temp_min: number | null; temp_max: number | null;
  }>

  const monthlyKw = monthReadings.reduce((sum, r) => sum + (r.consumption_hp || 0), 0)
  const daysWithData = monthReadings.filter(r => r.consumption_hp != null).length
  const avgDaily = daysWithData > 0 ? monthlyKw / daysWithData : 0

  // Price
  const priceSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('price_per_kwh') as { value: string } | undefined
  const pricePerKwh = priceSetting ? parseFloat(priceSetting.value) : 0.3288
  const monthCost = monthlyKw * pricePerKwh

  // All daily readings for charts
  const allReadings = db.prepare(`
    SELECT date, consumption_hp, consumption_elec, temp_min, temp_max
    FROM daily_readings
    WHERE consumption_hp IS NOT NULL
    ORDER BY date ASC
  `).all()

  // Monthly summaries
  const monthlySummaries = db.prepare(`
    SELECT * FROM monthly_summary ORDER BY year ASC, month ASC
  `).all()

  // Temperature stats
  const avgTemp = monthReadings.length > 0
    ? monthReadings.reduce((sum, r) => sum + ((r.temp_max || 0) + (r.temp_min || 0)) / 2, 0) / monthReadings.length
    : null

  // Last reading
  const lastReading = db.prepare('SELECT * FROM daily_readings ORDER BY date DESC LIMIT 1').get()

  // Yearly totals
  const yearlyStats = db.prepare(`
    SELECT
      strftime('%Y', date) as year,
      SUM(consumption_hp) as total_kwh,
      AVG(consumption_hp) as avg_daily,
      COUNT(*) as days
    FROM daily_readings
    WHERE consumption_hp IS NOT NULL
    GROUP BY strftime('%Y', date)
  `).all()

  return NextResponse.json({
    currentMonth: {
      kw: Math.round(monthlyKw * 10) / 10,
      cost: Math.round(monthCost * 100) / 100,
      avgDaily: Math.round(avgDaily * 10) / 10,
      avgTemp: avgTemp !== null ? Math.round(avgTemp * 10) / 10 : null,
      days: daysWithData,
    },
    pricePerKwh,
    allReadings,
    monthlySummaries,
    lastReading,
    yearlyStats,
  })
}
