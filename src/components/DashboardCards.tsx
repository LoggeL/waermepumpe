'use client'

interface CardData {
  label: string
  value: string
  sub?: string
  color: string
  accent?: string
}

const animClasses = ['anim-1', 'anim-2', 'anim-3', 'anim-4']

export default function DashboardCards({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`card card-hover ${animClasses[i] ?? ''}`}
          style={{ '--accent': card.accent ?? 'rgba(255,255,255,0.07)' } as React.CSSProperties}
        >
          <p className="section-label mb-3">{card.label}</p>
          <p
            className={`stat-value text-2xl font-bold leading-none ${card.color}`}
          >
            {card.value}
          </p>
          {card.sub && (
            <p className="section-label mt-2.5">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
