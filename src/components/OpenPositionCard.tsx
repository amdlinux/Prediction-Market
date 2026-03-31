// src/components/OpenPositionCard.tsx
import Link                       from 'next/link'
import { unrealizedPnL, formatPnL, pnlColor, pnlBg, $ } from '@/lib/pnl'

type Props = {
  position: {
    id              : string
    marketId        : string
    side            : string
    quantity        : number
    priceCents      : number
    market          : {
      title         : string
      status        : string
    }
  }
  currentPriceCents: number
}

export default function OpenPositionCard({ position, currentPriceCents }: Props) {
  const pnl = unrealizedPnL(
    position.quantity,
    position.priceCents,
    currentPriceCents,
  )

  return (
    <div className={`rounded-xl p-4 border ${pnlBg(pnl.pnlCents)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            href={`/markets/${position.marketId}`}
            className="text-white text-sm font-medium hover:text-indigo-300
                       transition line-clamp-2"
          >
            {position.market.title}
          </Link>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className={`
              font-bold
              ${position.side === 'YES' ? 'text-green-400' : 'text-red-400'}
            `}>
              {position.side}
            </span>
            <span>{position.quantity} contracts</span>
            <span>avg {position.priceCents}¢</span>
            <span>now {currentPriceCents}¢</span>
          </div>
        </div>

        {/* P&L column */}
        <div className="text-right ml-4 shrink-0">
          <p className={`font-bold text-base ${pnlColor(pnl.pnlCents)}`}>
            {formatPnL(pnl.pnlCents)}
          </p>
          <p className={`text-xs ${pnlColor(pnl.pnlCents)}`}>
            {pnl.pnlPercent > 0 ? '+' : ''}{pnl.pnlPercent}%
          </p>
        </div>
      </div>

      {/* Value breakdown */}
      <div className="mt-3 pt-3 border-t border-gray-700/50
                      flex justify-between text-xs text-gray-500">
        <span>Cost {$(pnl.costCents)}</span>
        <span>Current value {$(pnl.currentValueCents)}</span>
        <span>Payout if win {$(position.quantity * 100)}</span>
      </div>
    </div>
  )
}