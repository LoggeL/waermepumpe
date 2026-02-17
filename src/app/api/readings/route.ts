import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')
  const month = searchParams.get('month') // format: 2026-02

  let query = 'SELECT * FROM daily_readings'
  const params: (string | number)[] = []

  if (month) {
    query += ' WHERE date LIKE ?'
    params.push(`${month}%`)
  }

  query += ' ORDER BY date DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const readings = db.prepare(query).all(...params)
  const total = db.prepare(
    month
      ? 'SELECT COUNT(*) as c FROM daily_readings WHERE date LIKE ?'
      : 'SELECT COUNT(*) as c FROM daily_readings'
  ).get(...(month ? [`${month}%`] : [])) as { c: number }

  return NextResponse.json({ readings, total: total.c })
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const body = await request.json()
  const { date, meter_hp, meter_elec, temp_min, temp_max, notes } = body

  if (!date || meter_hp == null) {
    return NextResponse.json({ error: 'Datum und Wärmepumpe-Zählerstand sind erforderlich' }, { status: 400 })
  }

  // Get previous reading for consumption calculation
  const prev = db.prepare(
    'SELECT meter_hp, meter_elec FROM daily_readings WHERE date < ? ORDER BY date DESC LIMIT 1'
  ).get(date) as { meter_hp: number; meter_elec: number } | undefined

  const consumption_hp = prev ? meter_hp - prev.meter_hp : null
  const consumption_elec = prev && meter_elec != null ? meter_elec - prev.meter_elec : null

  // Validate: new reading must be >= previous
  if (prev && meter_hp < prev.meter_hp) {
    return NextResponse.json({
      error: `Zählerstand muss >= ${prev.meter_hp} sein (vorheriger Wert)`
    }, { status: 400 })
  }

  try {
    const result = db.prepare(`
      INSERT INTO daily_readings (date, meter_hp, meter_elec, consumption_hp, consumption_elec, temp_min, temp_max, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(date, meter_hp, meter_elec || 0, consumption_hp, consumption_elec, temp_min, temp_max, notes || null)

    // Recalculate consumption for the next day's reading if it exists
    const next = db.prepare(
      'SELECT id, meter_hp, meter_elec FROM daily_readings WHERE date > ? ORDER BY date ASC LIMIT 1'
    ).get(date) as { id: number; meter_hp: number; meter_elec: number } | undefined

    if (next) {
      db.prepare('UPDATE daily_readings SET consumption_hp = ?, consumption_elec = ? WHERE id = ?')
        .run(next.meter_hp - meter_hp, meter_elec ? next.meter_elec - meter_elec : null, next.id)
    }

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
    if (msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Eintrag für dieses Datum existiert bereits' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
