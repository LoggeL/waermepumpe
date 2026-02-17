'use client'

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
  readings: Reading[]
  onEdit: (r: Reading) => void
  onDelete: (id: number) => void
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

export default function ReadingsTable({ readings, onEdit, onDelete }: Props) {
  return (
    <div className="card overflow-x-auto">
      <h3 className="mb-3 text-sm font-medium text-[#8b8fa3]">Einträge</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2e3f] text-left text-xs text-[#8b8fa3]">
            <th className="pb-2 pr-3">Datum</th>
            <th className="pb-2 pr-3">WP (kWh)</th>
            <th className="hidden pb-2 pr-3 sm:table-cell">Strom</th>
            <th className="pb-2 pr-3">Verbr.</th>
            <th className="hidden pb-2 pr-3 sm:table-cell">Temp</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {readings.map(r => (
            <tr key={r.id} className="border-b border-[#2a2e3f]/50 hover:bg-[#1e2130]">
              <td className="py-2 pr-3 text-xs">{formatDate(r.date)}</td>
              <td className="py-2 pr-3">{r.meter_hp}</td>
              <td className="hidden py-2 pr-3 sm:table-cell">{r.meter_elec}</td>
              <td className="py-2 pr-3">
                {r.consumption_hp != null && (
                  <span className={r.consumption_hp > 30 ? 'text-orange-400' : r.consumption_hp > 20 ? 'text-yellow-400' : 'text-green-400'}>
                    {r.consumption_hp} kWh
                  </span>
                )}
              </td>
              <td className="hidden py-2 pr-3 text-xs text-[#8b8fa3] sm:table-cell">
                {r.temp_max != null && `${r.temp_max}/${r.temp_min}°C`}
              </td>
              <td className="py-2 text-right">
                <button
                  onClick={() => onEdit(r)}
                  className="mr-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  Bearb.
                </button>
                <button
                  onClick={() => {
                    if (confirm('Eintrag löschen?')) onDelete(r.id)
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
