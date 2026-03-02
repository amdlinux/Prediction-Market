// src/components/AdminMarketList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Market = {
  id      : string
  title   : string
  category: string
  status  : string
  outcome : string | null
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? ''

export default function AdminMarketList({ markets }: { markets: Market[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})

  async function handleSettle(marketId: string, outcome: 'YES' | 'NO') {
    setLoading(`${marketId}-settle-${outcome}`)
    try {
      const res = await fetch(`/api/admin/markets/${marketId}/settle`, {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ outcome }),
      })
      const data = await res.json()
      console.log(data);
      if (!res.ok) throw new Error(data.error)

      setResults(prev => ({
        ...prev,
        [marketId]: `✅ Settled ${outcome} — ${data.results.winners} winners, ${data.results.losers} losers`
      }))
      router.refresh()
    } catch (err: any) {
      setResults(prev => ({ ...prev, [marketId]: `❌ ${err.message}` }))
    } finally {
      setLoading(null)
    }
  }

  async function handleVoid(marketId: string) {
    const reason = window.prompt('Reason for voiding this market?')
    if (!reason) return

    setLoading(`${marketId}-void`)
    try {
      const res = await fetch(`/api/admin/markets/${marketId}/void`, {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResults(prev => ({
        ...prev,
        [marketId]: `✅ Voided — ${data.results.refunded} positions refunded`
      }))
      router.refresh()
    } catch (err: any) {
      setResults(prev => ({ ...prev, [marketId]: `❌ ${err.message}` }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {markets.map(market => (
        <div
          key={market.id}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          {/* Market info */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white font-medium">{market.title}</p>
              <p className="text-gray-500 text-xs mt-1">{market.category}</p>
            </div>
            <span className={`
              text-xs font-semibold px-2 py-1 rounded-full
              ${market.status === 'OPEN'     ? 'bg-green-900/50 text-green-400' : ''}
              ${market.status === 'RESOLVED' ? 'bg-yellow-900/50 text-yellow-400' : ''}
              ${market.status === 'VOIDED'   ? 'bg-gray-800 text-gray-400' : ''}
            `}>
              {market.status}
              {market.outcome ? ` · ${market.outcome}` : ''}
            </span>
          </div>

          {/* Result message */}
          {results[market.id] && (
            <p className="text-sm mb-3 text-gray-300 bg-gray-800 rounded-lg px-3 py-2">
              {results[market.id]}
            </p>
          )}

          {/* Action buttons — only show for OPEN markets */}
          {market.status === 'OPEN' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleSettle(market.id, 'YES')}
                disabled={loading !== null}
                className="bg-green-700 hover:bg-green-600 disabled:opacity-50
                           text-white text-sm px-4 py-2 rounded-lg transition"
              >
                {loading === `${market.id}-settle-YES` ? 'Settling...' : 'Resolve YES'}
              </button>
              <button
                onClick={() => handleSettle(market.id, 'NO')}
                disabled={loading !== null}
                className="bg-red-800 hover:bg-red-700 disabled:opacity-50
                           text-white text-sm px-4 py-2 rounded-lg transition"
              >
                {loading === `${market.id}-settle-NO` ? 'Settling...' : 'Resolve NO'}
              </button>
              <button
                onClick={() => handleVoid(market.id)}
                disabled={loading !== null}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50
                           text-white text-sm px-4 py-2 rounded-lg transition"
              >
                {loading === `${market.id}-void` ? 'Voiding...' : 'Void Market'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}