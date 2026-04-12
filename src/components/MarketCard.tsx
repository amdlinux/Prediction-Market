// src/components/MarketCard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { TrendingUp }          from 'lucide-react'
import PriceChart              from './PriceChart'
import Link from 'next/link'
import StatusBadge from './StatusBadge'

type Market = {
  id         : string
  title      : string
  category   : string
  closingDate: Date
  status     : string
  outcome    : string|null
  yesShares  : number
  noShares   : number
  liquidityB : number
}

type Position = {
  id        : string
  side      : string
  quantity  : number
  priceCents: number
} | null

type PriceSummary = {
  yesCents   : number
  noCents    : number
  yesDisplay : string
  noDisplay  : string
}

export default function MarketCard({
  market,
  existingPosition,
  initialPrice,
  isPractice = false
}: {
  market           : Market
  existingPosition : Position
  initialPrice     : PriceSummary
  isPractice?: boolean
}) {
  const router   = useRouter()
  const [price,   setPrice]   = useState<PriceSummary>(initialPrice)
  const [quantity, setQuantity] = useState(1)
  const [loading,  setLoading]  = useState<'YES' | 'NO' | null>(null)
  const [error,    setError]    = useState('')
  const [showChart, setShowChart] = useState(false)
  // Estimated cost for the current quantity
  // We fetch this from the server so it uses exact LMSR math
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)

  useEffect(() => {
    // Fetch estimated cost whenever quantity changes
    // This hits a lightweight endpoint — no database write
    fetch(`/api/markets/${market.id}/quote?quantity=${quantity}`)
      .then(r => r.json())
      .then(d => setEstimatedCost(d.yesCost ?? null))
      .catch(() => {})
  }, [market.id, quantity])

  async function handleBet(side: 'YES' | 'NO') {
    setLoading(side)
    setError('')

    try {
      const res = await fetch('/api/positions', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ marketId: market.id, side, quantity,isPractice }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      // Update price display immediately with new price
      if (data.newPrice) setPrice(data.newPrice)
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const closingDate = new Date(market.closingDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition
    ${isPractice
        ? 'bg-purple-950/20 border-purple-800/40 hover:border-purple-700/60'
        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }
    `}>
      {isPractice && (
        <div className="text-purple-400 text-xs mb-2 font-medium">
          🎮 Practice
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
              {market.category}
            </span>
            {/* Show badge if market is not just OPEN */}
            {market.status !== 'OPEN' && (
              <StatusBadge status={market.status} outcome={market.outcome} />
            )}
        </div>
        <span className="text-xs text-gray-500">Closes {closingDate}</span>
  </div>

      {/* Question */}
      <Link
        href={`/markets/${market.id}`}
        className="text-white font-medium text-base mb-4 leading-snug
                  hover:text-indigo-300 transition block"
      >
        {market.title}
      </Link>

      {/* Live price bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-green-400 text-sm font-bold">
            YES {price.yesDisplay}
          </span>
          <span className="text-red-400 text-sm font-bold">
            NO {price.noDisplay}
          </span>
        </div>
        {/* Visual probability bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${price.yesCents}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{price.yesCents}% chance YES</span>
          <button
            onClick={() => setShowChart(v => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            {showChart ? 'Hide chart ↑' : 'Price history ↓'}
          </button>
        </div>
      </div>

      {/* Price chart (toggled) */}
      {showChart && <PriceChart marketId={market.id} />}

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm mb-3 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Already has a position */}
      {existingPosition ? (
        <div className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          ${existingPosition.side === 'YES'
            ? 'bg-green-900/40 text-green-400 border border-green-800'
            : 'bg-red-900/40  text-red-400   border border-red-800'
          }
        `}>
          <TrendingUp size={14} />
          You bet {existingPosition.side}
          · {existingPosition.quantity} contract
          · avg {existingPosition.priceCents}¢ each
        </div>
      ) : (
        <div>
          {/* Quantity selector */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-400 text-sm">Contracts:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700
                           text-white text-sm transition flex items-center justify-center"
              >
                −
              </button>
              <span className="text-white font-medium w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(100, q + 1))}
                className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700
                           text-white text-sm transition flex items-center justify-center"
              >
                +
              </button>
            </div>
            {estimatedCost !== null && (
              <span className="text-gray-400 text-xs ml-2">
                Est. cost: ${(estimatedCost / 100).toFixed(2)}
              </span>
            )}
          </div>

          {/* YES/NO buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleBet('YES')}
              disabled={loading !== null}
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50
                         text-white font-semibold py-2.5 rounded-lg transition text-sm"
            >
              {loading === 'YES'
                ? 'Placing...'
                : `✓  YES  ${price.yesDisplay}`}
            </button>
            <button
              onClick={() => handleBet('NO')}
              disabled={loading !== null}
              className="flex-1 bg-red-800 hover:bg-red-700 disabled:opacity-50
                         text-white font-semibold py-2.5 rounded-lg transition text-sm"
            >
              {loading === 'NO'
                ? 'Placing...'
                : `✗  NO  ${price.noDisplay}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}