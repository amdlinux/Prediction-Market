// src/components/PracticePanel.tsx
'use client'

import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import Link          from 'next/link'
import { $  }        from '@/lib/pnl'

type PracticePosition = {
  id        : string
  marketId  : string
  side      : string
  quantity  : number
  priceCents: number
  market    : { title: string; status: string }
}

export default function PracticePanel({
  practiceBalance,
  practiceReserved,
  practiceAvailable,
  positions,
}: {
  practiceBalance  : number
  practiceReserved : number
  practiceAvailable: number
  positions        : PracticePosition[]
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleReset() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setLoading(true)
    try {
      await fetch('/api/wallet/practice/reset', { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-purple-300">
            Practice Account
          </h2>
          <p className="text-purple-400/70 text-xs mt-0.5">
            Virtual money — trade without risk. Prices are real, money isn't.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={loading}
          className={`
            text-xs px-3 py-1.5 rounded-lg transition font-medium
            ${confirm
              ? 'bg-red-700 hover:bg-red-600 text-white'
              : 'bg-purple-900/50 hover:bg-purple-800/50 text-purple-300'
            }
          `}
        >
          {loading   ? 'Resetting...'
           : confirm ? 'Click again to confirm reset'
           : '↺ Reset to $1,000'}
        </button>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
          <p className="text-purple-400/70 text-xs mb-1">Total</p>
          <p className="text-white font-bold">{$(practiceBalance)}</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
          <p className="text-purple-400/70 text-xs mb-1">In Bets</p>
          <p className="text-yellow-400 font-bold">{$(practiceReserved)}</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
          <p className="text-purple-400/70 text-xs mb-1">Available</p>
          <p className="text-green-400 font-bold">{$(practiceAvailable)}</p>
        </div>
      </div>

      {/* Practice positions */}
      {positions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-purple-400/60 text-sm mb-3">
            No practice positions yet.
          </p>
          <Link
            href="/markets?mode=practice"
            className="text-purple-400 hover:text-purple-300 text-sm transition"
          >
            Trade with practice money →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-purple-400/70 text-xs uppercase tracking-wide mb-2">
            Open Positions
          </p>
          {positions.map(pos => (
            <div
              key={pos.id}
              className="flex items-center justify-between bg-purple-900/20
                         border border-purple-800/30 rounded-lg px-3 py-2.5"
            >
              <div>
                <p className="text-white text-xs font-medium line-clamp-1">
                  {pos.market.title}
                </p>
                <p className="text-purple-400/60 text-xs mt-0.5">
                  {pos.quantity} × {pos.side} @ {pos.priceCents}¢
                </p>
              </div>
              <span className={`
                text-xs font-bold
                ${pos.side === 'YES' ? 'text-green-400' : 'text-red-400'}
              `}>
                {pos.side}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}