// src/components/MarketDetailClient.tsx
'use client'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import Link                from 'next/link'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import StatusBadge from './StatusBadge'

type Market = {
  id         : string
  title      : string
  description: string
  category   : string
  closingDate: string
  status     : string
  outcome    : string | null
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
  yesCents  : number
  noCents   : number
  yesDisplay: string
  noDisplay : string
}

const $ = (cents: number) => `$${(cents / 100).toFixed(2)}`

export default function MarketDetailClient({
  market,
  myPosition,
  initialPrice,
  chartData,
}: {
  market      : Market
  myPosition  : Position
  initialPrice: PriceSummary
  chartData   : { trade: number; yes: number; no: number }[]
}) {
  const router = useRouter()

  const [price,    setPrice]    = useState(initialPrice)
  const [quantity, setQuantity] = useState(1)
  const [loading,  setLoading]  = useState<'YES' | 'NO' | null>(null)
  const [error,    setError]    = useState('')

  const closingDate = new Date(market.closingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const isOpen = market.status === 'OPEN'

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
          quantity,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      if (data.newPrice) setPrice(data.newPrice)
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/markets" className="text-gray-500 hover:text-gray-300 text-sm transition">
          ← Markets
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-400 text-sm truncate max-w-sm">
          {market.title}
        </span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-8">

          {/* ── Left column: market info + chart ─────────── */}
          <div className="col-span-2 space-y-6">

            {/* Category + status badges */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
                {market.category}
              </span>
              <StatusBadge status={market.status} outcome={market.outcome} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white leading-snug">
              {market.title}
            </h1>

            {/* Description */}
            {market.description && (
              <p className="text-gray-400 text-sm leading-relaxed">
                {market.description}
              </p>
            )}

            {/* Closing date */}
            <p className="text-gray-500 text-sm">
              {market.status === 'OPEN'
                ? `Closes ${closingDate}`
                : `Closed ${closingDate}`}
            </p>

            {/* Live price bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Current Price</p>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 text-xl font-bold">
                      YES {price.yesDisplay}
                    </span>
                    <span className="text-gray-600">|</span>
                    <span className="text-red-400 text-xl font-bold">
                      NO {price.noDisplay}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Implied probability</p>
                  <p className="text-white text-lg font-bold">
                    {price.yesCents}% YES
                  </p>
                </div>
              </div>

              {/* Probability bar */}
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-600 to-green-400
                             rounded-full transition-all duration-500"
                  style={{ width: `${price.yesCents}%` }}
                />
              </div>
            </div>

            {/* Price history chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm font-medium text-gray-300 mb-4">
                YES Price History
              </p>
              {chartData.length <= 1 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No trades yet. Be the first to trade on this market.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="trade"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      label={{
                        value : 'Trades',
                        position: 'insideBottom',
                        offset: -2,
                        style : { fill: '#6b7280', fontSize: 10 },
                      }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={v => `${v}¢`}
                      width={38}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}¢`, 'YES price']}
                      labelFormatter={l => `After trade #${l}`}
                      contentStyle={{
                        background  : '#111827',
                        border      : '1px solid #374151',
                        borderRadius: '8px',
                        fontSize    : '12px',
                      }}
                    />
                    <ReferenceLine
                      y={50}
                      stroke="#374151"
                      strokeDasharray="4 4"
                    />
                    <Line
                      type="monotone"
                      dataKey="yes"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Right column: betting panel ───────────────── */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">

              <p className="text-sm font-medium text-gray-300 mb-4">
                Place a Bet
              </p>

              {/* Already has position */}
              {myPosition && (
                <div className={`
                  mb-4 p-3 rounded-lg text-sm border
                  ${myPosition.side === 'YES'
                    ? 'bg-green-900/30 border-green-800 text-green-400'
                    : 'bg-red-900/30   border-red-800   text-red-400'
                  }
                `}>
                  You hold {myPosition.quantity}x {myPosition.side}
                  <br />
                  <span className="text-xs opacity-70">
                    avg entry: {myPosition.priceCents}¢
                  </span>
                </div>
              )}

              {/* Market not open */}
              {!isOpen && (
                <div className="mb-4 p-3 rounded-lg bg-gray-800 text-gray-400 text-sm">
                  {market.status === 'RESOLVED' && (
                    <>Market resolved <strong>{market.outcome}</strong></>
                  )}
                  {market.status === 'HALTED' && (
                    <>Trading is paused on this market.</>
                  )}
                  {market.status === 'VOIDED' && (
                    <>This market was voided. All bets refunded.</>
                  )}
                </div>
              )}

              {/* Betting controls */}
              {isOpen && (
                <>
                  {/* Quantity */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">
                      Contracts
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700
                                   text-white transition flex items-center justify-center"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min={1}
                        max={1000}
                        onChange={e => setQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg
                                   text-white text-center py-1.5 text-sm focus:outline-none
                                   focus:border-indigo-500"
                      />
                      <button
                        onClick={() => setQuantity(q => Math.min(1000, q + 1))}
                        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700
                                   text-white transition flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-400 text-xs mb-3 bg-red-900/20
                                  border border-red-800 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleBet('YES')}
                      disabled={loading !== null}
                      className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50
                                 text-white font-bold py-3 rounded-lg transition"
                    >
                      {loading === 'YES' ? 'Placing...' : `Buy YES  ${price.yesDisplay}`}
                    </button>
                    <button
                      onClick={() => handleBet('NO')}
                      disabled={loading !== null}
                      className="w-full bg-red-800 hover:bg-red-700 disabled:opacity-50
                                 text-white font-bold py-3 rounded-lg transition"
                    >
                      {loading === 'NO' ? 'Placing...' : `Buy NO  ${price.noDisplay}`}
                    </button>
                  </div>

                  {/* Payout info */}
                  <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Payout if correct</span>
                      <span className="text-white">
                        ${(quantity).toFixed(2)} ({quantity} × $1.00)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current YES price</span>
                      <span className="text-white">{price.yesDisplay}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
