'use client'

interface CardData {
  label: string
  value: string
  sub?: string
  color: string
}

export default function DashboardCards({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, i) => (
        <div key={i} className="card card-hover">
          <p className="mb-1 text-xs text-[#8b8fa3]">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          {card.sub && <p className="mt-1 text-xs text-[#8b8fa3]">{card.sub}</p>}
        </div>
      ))}
    </div>
  )
}
