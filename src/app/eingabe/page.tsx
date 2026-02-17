'use client'

import { useState, useEffect, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import DataEntryForm from '@/components/DataEntryForm'
import OCRUpload from '@/components/OCRUpload'
import ReadingsTable from '@/components/ReadingsTable'

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

export default function EingabePage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [editReading, setEditReading] = useState<Reading | null>(null)

  const loadReadings = useCallback(async () => {
    const res = await fetch('/api/readings?limit=30')
    const data = await res.json()
    setReadings(data.readings)
  }, [])

  useEffect(() => {
    loadReadings()
  }, [loadReadings])

  function handleOCRResult(value: number, meter: 'hp' | 'elec') {
    const input = document.getElementById(meter === 'hp' ? 'meter_hp' : 'meter_elec') as HTMLInputElement
    if (input) {
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      nativeSetter?.call(input, String(value))
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/readings/${id}`, { method: 'DELETE' })
    loadReadings()
  }

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="animate-fade-in">
          <h1 className="page-title">Daten Eingabe</h1>
          <p className="section-label mt-1">Zählerstand erfassen</p>
        </div>

        <OCRUpload onResult={handleOCRResult} />

        <DataEntryForm
          editReading={editReading}
          onSaved={() => {
            setEditReading(null)
            loadReadings()
          }}
          onCancel={editReading ? () => setEditReading(null) : undefined}
        />

        <ReadingsTable
          readings={readings}
          onEdit={setEditReading}
          onDelete={handleDelete}
        />
      </main>
    </>
  )
}
