// src/components/MarketCard.tsx
'use client'

import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { TrendingUp }  from 'lucide-react'

type Market = {
  id         : string
  title      : string
  category   : string
  closingDate: Date
  status     : string
}

type Position = {
  id      : string
  side    : string
  quantity: number
  priceCents:number
} | null

const PRICE_CENTS = 50;

export default function MarketCard({
  market,
  existingPosition,
}: {
  market           : Market
  existingPosition : Position
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState<'YES' | 'NO' | null>(null)
  const [error,setError] = useState('');

  const closingDate = new Date(market.closingDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  async function handleBet(side: 'YES' | 'NO') {
    setLoading(side)
    setError('')
    try {
      const res = await fetch('/api/positions', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          marketId: market.id,
          side,
          quantity: 1,
          priceCents:PRICE_CENTS         // hardcoded for now — no price/qty UI yet
        }),
      })

      const data = await res.json();

      if (!res.ok) {
        throw new Error('Failed')
      }
      router.refresh() // re-fetch the page to show updated position
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">

      {/* Category + closing date */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
          {market.category}
        </span>
        <span className="text-xs text-gray-500">
          Closes {closingDate}
        </span>
      </div>

      {/* Question */}
      <p className="text-white font-medium text-base mb-4 leading-snug">
        {market.title}
      </p>

      {/* Error message (e.g. insufficient balance) */}
      {error && (
        <p className="text-red-400 text-sm mb-3 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* If user already has a position */}
      {existingPosition ? (
        <div className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          ${existingPosition.side === 'YES'
            ? 'bg-green-900/40 text-green-400 border border-green-800'
            : 'bg-red-900/40 text-red-400 border border-red-800'
          }
        `}>
          <TrendingUp size={14} />
          You bet {existingPosition.side} · {existingPosition.quantity} contract
          · ${(existingPosition.priceCents/ 100).toFixed(2)} each
        </div>
      ) : (
        /* No position yet — show YES/NO buttons */
        <div className="flex gap-3">
          <p className="text-xs text-gray-500 self-center mr-1">
            Cost: ${(PRICE_CENTS / 100).toFixed(2)}/contract
          </p>
          <button
            onClick={() => handleBet('YES')}
            disabled={loading !== null}
            className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50
                       text-white font-semibold py-2 rounded-lg transition text-sm"
          >
            {loading === 'YES' ? 'Placing...' : '✓  YES'}
          </button>
          <button
            onClick={() => handleBet('NO')}
            disabled={loading !== null}
            className="flex-1 bg-red-800 hover:bg-red-700 disabled:opacity-50
                       text-white font-semibold py-2 rounded-lg transition text-sm"
          >
            {loading === 'NO' ? 'Placing...' : '✗  NO'}
          </button>
        </div>
      )}
    </div>
  )
}