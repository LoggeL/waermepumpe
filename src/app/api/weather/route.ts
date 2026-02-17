import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const LAT = 49.2667
const LON = 8.1333

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&start_date=${today}&end_date=${today}`

    const response = await fetch(url, { next: { revalidate: 3600 } })
    if (!response.ok) {
      return NextResponse.json({ error: 'Wetter-API Fehler' }, { status: 502 })
    }

    const data = await response.json()
    const daily = data.daily

    return NextResponse.json({
      date: daily.time[0],
      temp_max: daily.temperature_2m_max[0],
      temp_min: daily.temperature_2m_min[0],
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Fehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
