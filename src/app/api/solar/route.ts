import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const LAT = 49.2667
const LON = 8.1333

export async function GET() {
  try {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Fetch daily forecast for tomorrow
    const dailyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=sunshine_duration,shortwave_radiation_sum,uv_index_max&timezone=Europe/Berlin&start_date=${tomorrowStr}&end_date=${tomorrowStr}`

    // Fetch hourly cloud cover + radiation for tomorrow
    const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=cloud_cover,direct_radiation&timezone=Europe/Berlin&start_date=${tomorrowStr}&end_date=${tomorrowStr}`

    const [dailyRes, hourlyRes] = await Promise.all([
      fetch(dailyUrl, { next: { revalidate: 1800 } }),
      fetch(hourlyUrl, { next: { revalidate: 1800 } }),
    ])

    if (!dailyRes.ok || !hourlyRes.ok) {
      return NextResponse.json({ error: 'Open-Meteo API Fehler' }, { status: 502 })
    }

    const dailyData = await dailyRes.json()
    const hourlyData = await hourlyRes.json()

    const daily = dailyData.daily
    const sunshineSeconds = daily.sunshine_duration?.[0] ?? 0
    const sunshineHours = Math.round((sunshineSeconds / 3600) * 10) / 10
    const radiationSum = Math.round(daily.shortwave_radiation_sum?.[0] ?? 0) // MJ/m²
    const uvMax = daily.uv_index_max?.[0] ?? 0

    // Hourly data for chart: cloud cover and direct radiation
    const hours = hourlyData.hourly.time.map((t: string) => {
      const hour = new Date(t).getHours()
      return `${hour}:00`
    })
    const cloudCover = hourlyData.hourly.cloud_cover as number[]
    const directRadiation = hourlyData.hourly.direct_radiation as number[]

    // Average cloud cover for daytime hours (7-19)
    const daytimeCloud = cloudCover.slice(7, 20)
    const avgCloudCover = daytimeCloud.length > 0
      ? Math.round(daytimeCloud.reduce((a, b) => a + b, 0) / daytimeCloud.length)
      : 0

    // Peak radiation
    const peakRadiation = Math.round(Math.max(...directRadiation))

    // Estimate solar yield (rough: assume 5kWp system, ~75% efficiency)
    // radiation_sum is in MJ/m², convert: 1 MJ/m² ≈ 0.278 kWh/m²
    // For a 5kWp system with ~15% panel efficiency on ~33m² area
    const estimatedYieldKwh = Math.round(radiationSum * 0.278 * 5 * 0.75 * 10) / 10

    return NextResponse.json({
      date: tomorrowStr,
      sunshineHours,
      radiationSum,
      uvMax: Math.round(uvMax * 10) / 10,
      avgCloudCover,
      peakRadiation,
      estimatedYieldKwh,
      hourly: {
        hours,
        cloudCover,
        directRadiation,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Fehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
