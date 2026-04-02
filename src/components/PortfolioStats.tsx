// src/components/PortfolioStats.tsx
import { formatPnL, pnlColor, $ } from '@/lib/pnl'

type Props = {
  totalValueCents       : number
  cashCents             : number
  openPositionsValueCents: number
  totalUnrealizedPnL    : number
  totalRealizedPnL      : number
  isPractice?           : boolean
}

export default function PortfolioStats({
  totalValueCents,
  cashCents,
  openPositionsValueCents,
  totalUnrealizedPnL,
  totalRealizedPnL,
  isPractice = false,
}: Props) {
  const totalPnL = totalUnrealizedPnL + totalRealizedPnL

  return (
    <div className="space-y-4">

      {/* Total portfolio value — the big number */}
      <div className={`
        rounded-xl p-6 border
        ${isPractice
          ? 'bg-purple-900/20 border-purple-800/50'
          : 'bg-gray-900 border-gray-800'
        }
      `}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">
              {isPractice ? 'Practice Portfolio Value' : 'Total Portfolio Value'}
            </p>
            <p className="text-white text-4xl font-bold">
              {$(totalValueCents)}
            </p>
            {isPractice && (
              <p className="text-purple-400 text-xs mt-1">
                Virtual money — not real
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">All-time P&L</p>
            <p className={`text-xl font-bold ${pnlColor(totalPnL)}`}>
              {formatPnL(totalPnL)}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Cash Available</p>
          <p className="text-white text-xl font-bold">{$(cashCents)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Open Positions Value</p>
          <p className="text-white text-xl font-bold">
            {$(openPositionsValueCents)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Unrealized P&L</p>
          <p className={`text-xl font-bold ${pnlColor(totalUnrealizedPnL)}`}>
            {formatPnL(totalUnrealizedPnL)}
          </p>
          <p className="text-gray-500 text-xs mt-1">on open positions</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Realized P&L</p>
          <p className={`text-xl font-bold ${pnlColor(totalRealizedPnL)}`}>
            {formatPnL(totalRealizedPnL)}
          </p>
          <p className="text-gray-500 text-xs mt-1">from settled positions</p>
        </div>
      </div>
    </div>
  )
}