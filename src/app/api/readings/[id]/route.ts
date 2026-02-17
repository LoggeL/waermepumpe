import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  const id = parseInt(params.id)
  const body = await request.json()
  const { date, meter_hp, meter_elec, temp_min, temp_max, notes } = body

  const existing = db.prepare('SELECT * FROM daily_readings WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) {
    return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 })
  }

  // Recalculate consumption
  const prev = db.prepare(
    'SELECT meter_hp, meter_elec FROM daily_readings WHERE date < ? ORDER BY date DESC LIMIT 1'
  ).get(date || existing.date) as { meter_hp: number; meter_elec: number } | undefined

  const newMeterHp = meter_hp ?? existing.meter_hp
  const newMeterElec = meter_elec ?? existing.meter_elec
  const consumption_hp = prev ? (newMeterHp as number) - prev.meter_hp : null
  const consumption_elec = prev ? (newMeterElec as number) - prev.meter_elec : null

  db.prepare(`
    UPDATE daily_readings SET date = ?, meter_hp = ?, meter_elec = ?, consumption_hp = ?, consumption_elec = ?, temp_min = ?, temp_max = ?, notes = ?
    WHERE id = ?
  `).run(
    date || existing.date,
    newMeterHp,
    newMeterElec,
    consumption_hp,
    consumption_elec,
    temp_min ?? existing.temp_min,
    temp_max ?? existing.temp_max,
    notes ?? existing.notes,
    id
  )

  // Recalculate next reading's consumption
  const currentDate = date || existing.date
  const next = db.prepare(
    'SELECT id, meter_hp, meter_elec FROM daily_readings WHERE date > ? ORDER BY date ASC LIMIT 1'
  ).get(currentDate) as { id: number; meter_hp: number; meter_elec: number } | undefined

  if (next) {
    db.prepare('UPDATE daily_readings SET consumption_hp = ?, consumption_elec = ? WHERE id = ?')
      .run(next.meter_hp - (newMeterHp as number), next.meter_elec - (newMeterElec as number), next.id)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  const id = parseInt(params.id)

  const existing = db.prepare('SELECT * FROM daily_readings WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) {
    return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 })
  }

  // Before deleting, find prev and next to recalculate next's consumption
  const prev = db.prepare(
    'SELECT meter_hp, meter_elec FROM daily_readings WHERE date < ? ORDER BY date DESC LIMIT 1'
  ).get(existing.date) as { meter_hp: number; meter_elec: number } | undefined

  const next = db.prepare(
    'SELECT id, meter_hp, meter_elec FROM daily_readings WHERE date > ? ORDER BY date ASC LIMIT 1'
  ).get(existing.date) as { id: number; meter_hp: number; meter_elec: number } | undefined

  db.prepare('DELETE FROM daily_readings WHERE id = ?').run(id)

  if (next && prev) {
    db.prepare('UPDATE daily_readings SET consumption_hp = ?, consumption_elec = ? WHERE id = ?')
      .run(next.meter_hp - prev.meter_hp, next.meter_elec - prev.meter_elec, next.id)
  } else if (next) {
    db.prepare('UPDATE daily_readings SET consumption_hp = NULL, consumption_elec = NULL WHERE id = ?')
      .run(next.id)
  }

  return NextResponse.json({ success: true })
}
