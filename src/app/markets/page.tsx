// src/app/markets/page.tsx
import { db }              from '@/lib/db'
import { auth }            from '@clerk/nextjs/server'
import MarketCard          from '@/components/MarketCard'
import MarketFilters       from '@/components/MarketFilters'
import { getPriceSummary } from '@/lib/lmsr'
import { Suspense }        from 'react'
import { haltExpiredMarkets } from '@/lib/marketLifecycle'
import { is } from 'zod/locales'

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string, mode?:string }
}) {
  const { userId } = await auth()

  //need to check if map, than use get('mode') or this
  const params = await searchParams

  const isPractice = params.mode === 'practice'

  // Silently halt any expired markets every time the page loads
  // In production this is handled by the cron job — this is just a safety net
  await haltExpiredMarkets();
  
  const category = params.category ?? ''
  const search   = params.search   ?? ''

  // Build the where clause dynamically based on filters
  const whereBase = {
    ...(category ? { category } : {}),
    ...(search   ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  // Fetch open and halted markets separately
  const [openMarkets, haltedMarkets] = await Promise.all([
    db.market.findMany({
      where  : { ...whereBase, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    }),
    db.market.findMany({
      where  : { ...whereBase, status: 'HALTED' },
      orderBy: { closingDate: 'desc' },
    }),
  ])

  const myPositions = userId
    ? await db.position.findMany({ where: { userId } })
    : []

  const positionByMarket = new Map(
    myPositions.map(p => [p.marketId, p])
  )

  const allMarkets = [...openMarkets, ...haltedMarkets]

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {isPractice && (
        <div className="mb-6 px-4 py-3 bg-purple-900/30 border border-purple-700/50
                        rounded-xl flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          <div>
            <p className="text-purple-300 font-medium text-sm">Practice Mode</p>
            <p className="text-purple-400/70 text-xs">
              Bets use your $1,000 virtual balance. Prices are real, money isn't.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          Markets
          <span className="ml-2 text-base text-gray-500 font-normal">
            ({openMarkets.length} open)
          </span>
        </h2>
      </div>

      <Suspense>
        <MarketFilters
          currentCategory={category}
          currentSearch={search}
        />
      </Suspense>

      {/* Open markets */}
      {openMarkets.length > 0 && (
        <section className="mb-10">
          <h3 className="text-sm font-medium text-gray-400 uppercase
                         tracking-wide mb-4">
            Open for trading
          </h3>
          <div className="flex flex-col gap-4">
            {openMarkets.map(market => (
              <MarketCard
                key={market.id}
                market={market}
                existingPosition={positionByMarket.get(market.id) ?? null}
                initialPrice={getPriceSummary(
                  market.yesShares, market.noShares, market.liquidityB
                )}
                isPractice = {isPractice}
              />
            ))}
          </div>
        </section>
      )}

      {/* Halted markets */}
      {haltedMarkets.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-yellow-500 uppercase
                         tracking-wide mb-4">
            Awaiting resolution
          </h3>
          <div className="flex flex-col gap-4">
            {haltedMarkets.map(market => (
              <MarketCard
                key={market.id}
                market={market}
                existingPosition={positionByMarket.get(market.id) ?? null}
                initialPrice={getPriceSummary(
                  market.yesShares, market.noShares, market.liquidityB
                )}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {allMarkets.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No markets found.</p>
          {(category || search) && (
            <a href="/markets" className="text-indigo-400 hover:text-indigo-300 text-sm">
              Clear filters →
            </a>
          )}
        </div>
      )}
    </main>
  )
}