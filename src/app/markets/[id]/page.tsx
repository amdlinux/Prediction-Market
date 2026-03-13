// src/app/markets/[id]/page.tsx
import { notFound }        from 'next/navigation'
import { auth }            from '@clerk/nextjs/server'
import { db }              from '@/lib/db'
import { getPriceSummary } from '@/lib/lmsr'
import MarketDetailClient from '@/components/MarketDetailClient'

export default async function MarketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { userId } = await auth()

  // Fetch market with full details
  const paramsId = await params;
  const market = await db.market.findUnique({
    where: { id: paramsId.id },
  })

  if (!market) notFound()

  // Fetch this user's position on this market (if any)
  const myPosition = userId
    ? await db.position.findUnique({
        where: { userId_marketId: { userId, marketId: paramsId.id } },
      })
    : null

  // Calculate current price server-side
  const price = getPriceSummary(
    market.yesShares,
    market.noShares,
    market.liquidityB,
  )

  // Fetch price history for the chart
  const priceHistory = await db.priceHistory.findMany({
    where  : { marketId: paramsId.id },
    orderBy: { createdAt: 'asc' },
    take   : 200,
  })

  const chartData = [
    { trade: 0, yes: 50, no: 50 },
    ...priceHistory.map((h, i) => ({
      trade: i + 1,
      yes  : h.yesPricePct,
      no   : 100 - h.yesPricePct,
    })),
  ]

  return (
    <MarketDetailClient
      market={{
        id         : market.id,
        title      : market.title,
        description: market.description,
        category   : market.category,
        closingDate: market.closingDate.toISOString(),
        status     : market.status,
        outcome    : market.outcome,
        yesShares  : market.yesShares,
        noShares   : market.noShares,
        liquidityB : market.liquidityB,
      }}
      myPosition={myPosition}
      initialPrice={price}
      chartData={chartData}
    />
  )
}