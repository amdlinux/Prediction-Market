// src/app/markets/page.tsx
import { db }            from '@/lib/db'
import { auth }          from '@clerk/nextjs/server'
import { UserButton }    from '@clerk/nextjs'
import MarketCard from '@/components/MarketCard'

export default async function MarketsPage() {
  const { userId } = await auth()

  // Fetch all open markets from the database
  const markets = await db.market.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch this user's existing positions (so we can show what they've already bet on)
  const myPositions = await db.position.findMany({
    where: { userId: userId! },
  })

  // Build a quick lookup: marketId → position
  const positionByMarket = new Map(
    myPositions.map(p => [p.marketId, p])
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">Kalshi</h1>
        <div className="flex items-center gap-4">
          <a href="/portfolio" className="text-gray-400 hover:text-white text-sm">
            Portfolio
          </a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Markets grid */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6">Open Markets</h2>

        <div className="flex flex-col gap-4">
          {markets.map(market => (
            <MarketCard
              key={market.id}
              market={market}
              existingPosition={positionByMarket.get(market.id) ?? null}
            />
          ))}
        </div>
      </main>
    </div>
  )
}