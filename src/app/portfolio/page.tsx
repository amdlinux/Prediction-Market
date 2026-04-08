// src/app/portfolio/page.tsx
import { auth }              from '@clerk/nextjs/server'
import { db }                from '@/lib/db'
import { getOrCreateWallet, getAvailableBalance, getPracticeAvailable } from '@/lib/wallet'
import { getPriceSummary }   from '@/lib/lmsr'
import { portfolioValue, $, savePortfolioSnapshot } from '@/lib/pnl'
import { UserButton }        from '@clerk/nextjs'
import Link                  from 'next/link'
import PortfolioStats        from '@/components/PortfolioStats'
import OpenPositionCard      from '@/components/OpenPositionCard'
import SettledPositionCard   from '@/components/SettledPositionCard'
import PracticePanel         from '@/components/PracticePanel'
import PortfolioChart from '@/components/PortfolioChart'

export default async function PortfolioPage() {
  const { userId } = await auth()

  const [wallet, realPositions, practicePositions, settledPositions] =
    await Promise.all([
      getOrCreateWallet(userId!),

      // Real open positions
      db.position.findMany({
        where  : { userId: userId!, isPractice: false },
        include: { market: { select: { title: true, status: true, yesShares: true, noShares: true, liquidityB: true } } },
        orderBy: { createdAt: 'desc' },
      }),

      // Practice open positions
      db.position.findMany({
        where  : { userId: userId!, isPractice: true },
        include: { market: { select: { title: true, status: true, yesShares: true, noShares: true, liquidityB: true } } },
        orderBy: { createdAt: 'desc' },
      }),

      // Settled position history
      db.settledPosition.findMany({
        where  : { userId: userId! },
        orderBy: { settledAt: 'desc' },
        take   : 50,
      }),
    ])

  // Calculate current price for each real open position
  const realPositionsWithPrice = realPositions.map(pos => {
    const price = getPriceSummary(
      pos.market.yesShares,
      pos.market.noShares,
      pos.market.liquidityB,
    )
    const currentPriceCents = pos.side === 'YES' ? price.yesCents : price.noCents
    return { ...pos, currentPriceCents }
  })

  // Portfolio value calculation
  const pv = portfolioValue(
    wallet.cashbalanceCents,
    realPositionsWithPrice.map(p => ({
      quantity         : p.quantity,
      entryPriceCents  : p.priceCents,
      currentPriceCents: p.currentPriceCents,
    })),
  )

  await savePortfolioSnapshot(userId!,pv.totalValueCents)

  // Total realized P&L from settled positions
  const totalRealizedPnL = settledPositions.reduce(
    (sum, sp) => sum + sp.realizedPnLCents, 0
  )

  const snapshots = await db.portfolioSnapshot.findMany({
    where:{userId:userId!},
    orderBy:{
      createdAt:'asc'
    },
    take:90
  })

  const available         = getAvailableBalance(wallet)
  const practiceAvailable = getPracticeAvailable(wallet)

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">Kalshi</h1>
        <div className="flex items-center gap-4">
          <Link href="/markets" className="text-gray-400 hover:text-white text-sm">
            Markets
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* ── Real account ──────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Portfolio</h2>

          {/* Stats */}
          <PortfolioStats
            totalValueCents       ={pv.totalValueCents}
            cashCents             ={available}
            openPositionsValueCents={pv.openPositionValueCents}
            totalUnrealizedPnL    ={pv.totalUnrealizedPnL}
            totalRealizedPnL      ={totalRealizedPnL}
          />

          {snapshots.length >= 2 && (
            <div className="mt-6">
              <PortfolioChart snapshots={snapshots} />
            </div>
          )}
          
          {/* Wallet detail */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Total Cash</p>
              <p className="text-white font-bold">{$(wallet.cashbalanceCents)}</p>
            </div>
            <div className="bg-gray-900 border border-yellow-900/30 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Reserved in Bets</p>
              <p className="text-yellow-400 font-bold">{$(wallet.reservedCents)}</p>
            </div>
            <div className="bg-gray-900 border border-green-900/30 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Available</p>
              <p className="text-green-400 font-bold">{$(available)}</p>
            </div>
          </div>
        </section>

        {/* ── Open positions ────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Open Positions
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({realPositionsWithPrice.length})
            </span>
          </h2>

          {realPositionsWithPrice.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-3">No open positions.</p>
              <Link href="/markets" className="text-indigo-400 hover:text-indigo-300 text-sm">
                Browse markets →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {realPositionsWithPrice.map(pos => (
                <OpenPositionCard
                  key={pos.id}
                  position={pos}
                  currentPriceCents={pos.currentPriceCents}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Settled positions ─────────────────────────── */}
        {settledPositions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Trade History
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({settledPositions.length})
              </span>
            </h2>
            <div className="flex flex-col gap-3">
              {settledPositions.map(sp => (
                <SettledPositionCard key={sp.id} position={sp} />
              ))}
            </div>
          </section>
        )}

        {/* ── Practice account ──────────────────────────── */}
        <section>
          <PracticePanel
            practiceBalance ={wallet.practiceBalanceCents}
            practiceReserved={wallet.practiceReservedCents}
            practiceAvailable={practiceAvailable}
            positions       ={practicePositions}
          />
        </section>

      </main>
    </div>
  )
}