// src/components/SettledPositionCard.tsx
import { formatPnL, pnlColor, pnlBg, $ } from '@/lib/pnl'

type SettledPosition = {
  id              : string
  marketTitle     : string
  side            : string
  quantity        : number
  entryPriceCents : number
  exitPriceCents  : number
  realizedPnLCents: number
  settledAt       : Date
}

export default function SettledPositionCard({
  position,
}: {
  position: SettledPosition
}) {
  const won      = position.exitPriceCents === 100
  const costCents = position.quantity * position.entryPriceCents

  return (
    <div className={`rounded-xl p-4 border ${pnlBg(position.realizedPnLCents)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium line-clamp-2">
            {position.marketTitle}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className={`font-bold
              ${position.side === 'YES' ? 'text-green-400' : 'text-red-400'}
            `}>
              {position.side}
            </span>
            <span>{position.quantity} contracts</span>
            <span>entry {position.entryPriceCents}¢</span>
            <span className={won ? 'text-green-400' : 'text-red-400'}>
              {won ? '🎉 Won' : '❌ Lost'}
            </span>
          </div>
        </div>

        <div className="text-right ml-4 shrink-0">
          <p className={`font-bold text-base ${pnlColor(position.realizedPnLCents)}`}>
            {formatPnL(position.realizedPnLCents)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(position.settledAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50
                      flex justify-between text-xs text-gray-500">
        <span>Paid {$(costCents)}</span>
        <span>Received {$(position.quantity * position.exitPriceCents)}</span>
        <span className={pnlColor(position.realizedPnLCents)}>
          Net {formatPnL(position.realizedPnLCents)}
        </span>
      </div>
    </div>
  )
}