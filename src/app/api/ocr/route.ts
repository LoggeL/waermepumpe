import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY nicht konfiguriert' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('image') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Kein Bild hochgeladen' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = file.type || 'image/jpeg'

  // Get last known meter values to help identify which meter
  const db = getDb()
  const lastReading = db.prepare(
    'SELECT meter_hp, meter_elec FROM daily_readings ORDER BY date DESC LIMIT 1'
  ).get() as { meter_hp: number; meter_elec: number } | undefined

  const lastHp = lastReading?.meter_hp ?? 0
  const lastElec = lastReading?.meter_elec ?? 0

  const prompt = `Du siehst ein Foto eines Stromzählers oder Wärmepumpen-Displays.

Bitte extrahiere die angezeigte Zahl (Zählerstand in kWh).

Bekannte letzte Werte:
- Wärmepumpe Zählerstand: ${lastHp} kWh
- Stromzähler: ${lastElec} kWh

Basierend auf der Nähe des abgelesenen Wertes zu diesen bekannten Werten, bestimme welcher Zähler es ist.

Antworte NUR im JSON Format:
{"value": <Zahl>, "meter": "hp" oder "elec", "confidence": "high" oder "low"}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
          ]
        }],
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `OpenRouter API Fehler: ${err}` }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        value: parsed.value,
        meter: parsed.meter,
        confidence: parsed.confidence,
        raw: content,
        lastValues: { hp: lastHp, elec: lastElec }
      })
    }

    return NextResponse.json({ error: 'Konnte keine Zahl erkennen', raw: content }, { status: 422 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
