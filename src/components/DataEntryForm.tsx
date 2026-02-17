'use client'

import { useState, useEffect } from 'react'

interface Reading {
  id: number
  date: string
  meter_hp: number
  meter_elec: number
  consumption_hp: number | null
  consumption_elec: number | null
  temp_min: number | null
  temp_max: number | null
  notes: string | null
}

interface Props {
  editReading?: Reading | null
  onSaved: () => void
  onCancel?: () => void
}

export default function DataEntryForm({ editReading, onSaved, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [meterHp, setMeterHp] = useState('')
  const [meterElec, setMeterElec] = useState('')
  const [tempMin, setTempMin] = useState('')
  const [tempMax, setTempMax] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)

  useEffect(() => {
    if (editReading) {
      setDate(editReading.date)
      setMeterHp(String(editReading.meter_hp))
      setMeterElec(String(editReading.meter_elec))
      setTempMin(editReading.temp_min != null ? String(editReading.temp_min) : '')
      setTempMax(editReading.temp_max != null ? String(editReading.temp_max) : '')
      setNotes(editReading.notes || '')
    }
  }, [editReading])

  async function fetchWeather() {
    setWeatherLoading(true)
    try {
      const res = await fetch('/api/weather')
      const data = await res.json()
      if (data.temp_min != null) setTempMin(String(Math.round(data.temp_min)))
      if (data.temp_max != null) setTempMax(String(Math.round(data.temp_max)))
    } catch {
      // ignore
    }
    setWeatherLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      date,
      meter_hp: parseFloat(meterHp),
      meter_elec: parseFloat(meterElec) || 0,
      temp_min: tempMin ? parseFloat(tempMin) : null,
      temp_max: tempMax ? parseFloat(tempMax) : null,
      notes: notes || null,
    }

    try {
      const url = editReading ? `/api/readings/${editReading.id}` : '/api/readings'
      const method = editReading ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fehler beim Speichern')
        setSaving(false)
        return
      }

      // Reset form
      if (!editReading) {
        setMeterHp('')
        setMeterElec('')
        setTempMin('')
        setTempMax('')
        setNotes('')
      }
      onSaved()
    } catch {
      setError('Netzwerkfehler')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-semibold">
        {editReading ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
      </h2>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-[#8b8fa3]">Datum</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="input-dark"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[#8b8fa3]">Wärmepumpe Zählerstand (kWh)</label>
        <input
          type="number"
          step="0.1"
          value={meterHp}
          onChange={e => setMeterHp(e.target.value)}
          className="input-dark"
          placeholder="z.B. 2803"
          required
          id="meter_hp"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[#8b8fa3]">Stromzähler (kWh)</label>
        <input
          type="number"
          step="0.1"
          value={meterElec}
          onChange={e => setMeterElec(e.target.value)}
          className="input-dark"
          placeholder="z.B. 104115"
          id="meter_elec"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-[#8b8fa3]">Temp. Min (°C)</label>
          <input
            type="number"
            step="0.1"
            value={tempMin}
            onChange={e => setTempMin(e.target.value)}
            className="input-dark"
            placeholder="-5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#8b8fa3]">Temp. Max (°C)</label>
          <input
            type="number"
            step="0.1"
            value={tempMax}
            onChange={e => setTempMax(e.target.value)}
            className="input-dark"
            placeholder="2"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={fetchWeather}
        disabled={weatherLoading}
        className="btn-secondary w-full"
      >
        {weatherLoading ? 'Lade Wetter...' : 'Wetter automatisch laden'}
      </button>

      <div>
        <label className="mb-1 block text-sm text-[#8b8fa3]">Notizen</label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="input-dark"
          placeholder="Optional"
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Speichere...' : editReading ? 'Aktualisieren' : 'Speichern'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Abbrechen
          </button>
        )}
      </div>
    </form>
  )
}
