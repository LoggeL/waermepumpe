'use client'

import { useState, useRef } from 'react'

interface Props {
  onResult: (value: number, meter: 'hp' | 'elec') => void
}

export default function OCRUpload({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ value: number; meter: string; confidence: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError('')
    setResult(null)
    setLoading(true)

    // Preview
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'OCR Fehler')
        setLoading(false)
        return
      }

      setResult(data)
    } catch {
      setError('Netzwerkfehler')
    }
    setLoading(false)
  }

  function handleAccept() {
    if (result) {
      onResult(result.value, result.meter as 'hp' | 'elec')
      setResult(null)
      setPreview(null)
    }
  }

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-medium text-[#8b8fa3]">Foto-Erkennung (OCR)</h3>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-secondary flex-1"
        >
          Foto aufnehmen / auswählen
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </div>

      {preview && (
        <img src={preview} alt="Vorschau" className="max-h-32 rounded-lg object-contain" />
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-[#8b8fa3]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Erkenne Zählerstand...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {result && (
        <div className="space-y-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
          <p className="text-sm">
            Erkannt: <span className="font-bold text-green-400">{result.value} kWh</span>
          </p>
          <p className="text-xs text-[#8b8fa3]">
            Zähler: {result.meter === 'hp' ? 'Wärmepumpe' : 'Stromzähler'}
            {' '}(Sicherheit: {result.confidence === 'high' ? 'Hoch' : 'Niedrig'})
          </p>
          <button onClick={handleAccept} className="btn-primary w-full text-sm">
            Wert übernehmen
          </button>
        </div>
      )}
    </div>
  )
}
