// src/app/portfolio/page.tsx
import { db }                                from '@/lib/db'
import { auth }                              from '@clerk/nextjs/server'
import { getOrCreateWallet, getAvailableBalance } from '@/lib/wallet'
import { UserButton }                        from '@clerk/nextjs'
import Link                                  from 'next/link'

const $ = (cents: number) => `$${(cents / 100).toFixed(2)}`

export default async function PortfolioPage() {
  const { userId } = await auth()

  const [wallet, positions, transactions] = await Promise.all([
    getOrCreateWallet(userId!),
    db.position.findMany({
      where  : { userId: userId! },
      include: { market: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.transaction.findMany({
      where  : { userId: userId! },
      orderBy: { createdAt: 'desc' },
      take   : 30,
    }),
  ])

  const available = getAvailableBalance(wallet)

  // Separate transactions by type for the history display
  const deposits    = transactions.filter(t => t.type === 'DEPOSIT')
  const bets        = transactions.filter(t => t.type === 'BET_PLACED')
  const settlements = transactions.filter(t =>
    t.type === 'BET_SETTLED' || t.type === 'BET_REFUNDED'
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">Kalshi</h1>
        <div className="flex items-center gap-4">
          <Link href="/markets" className="text-gray-400 hover:text-white text-sm">
            Markets
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── Wallet summary ──────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Wallet</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <p className="text-white text-2xl font-bold">
                {$(wallet.cashbalanceCents)}
              </p>
            </div>
            <div className="bg-gray-900 border border-yellow-900/40 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">In Open Bets</p>
              <p className="text-yellow-400 text-2xl font-bold">
                {$(wallet.reservedCents)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                locked until market resolves
              </p>
            </div>
            <div className="bg-gray-900 border border-green-900/40 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">Available</p>
              <p className="text-green-400 text-2xl font-bold">
                {$(available)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                can spend or withdraw
              </p>
            </div>
          </div>
        </section>

        {/* ── Open positions ──────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Open Positions
            {positions.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({positions.length})
              </span>
            )}
          </h2>

          {positions.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-3">No open positions.</p>
              <Link href="/markets" className="text-indigo-400 hover:text-indigo-300 text-sm">
                Browse markets →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {positions.map(pos => (
                <div
                  key={pos.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4
                             flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">
                      {pos.market.title}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {pos.quantity} contract
                      · paid {$(pos.priceCents)} each
                      · locked {$(pos.quantity * pos.priceCents)}
                    </p>
                  </div>
                  <span className={`
                    ml-4 px-3 py-1 rounded-full text-sm font-bold
                    ${pos.side === 'YES'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50   text-red-400'
                    }
                  `}>
                    {pos.side}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Settlement history ──────────────────────────── */}
        {settlements.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Settlement History</h2>
            <div className="flex flex-col gap-2">
              {settlements.map(tx => {
                const isWin    = tx.description.startsWith('Won:')
                const isRefund = tx.type === 'BET_REFUNDED'
                return (
                  <div
                    key={tx.id}
                    className={`
                      flex items-center justify-between rounded-xl px-4 py-3 border
                      ${isWin    ? 'bg-green-900/20 border-green-800/40' : ''}
                      ${isRefund ? 'bg-blue-900/20  border-blue-800/40'  : ''}
                      ${!isWin && !isRefund ? 'bg-gray-900 border-gray-800' : ''}
                    `}
                  >
                    <div>
                      <p className="text-white text-sm">{tx.description}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month : 'short', day  : 'numeric',
                          hour  : '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ml-4
                      ${isWin    ? 'text-green-400' : ''}
                      ${isRefund ? 'text-blue-400'  : ''}
                      ${!isWin && !isRefund ? 'text-gray-400' : ''}
                    `}>
                      {isWin    ? `+${$(tx.amountCents)}` : ''}
                      {isRefund ? `↩ ${$(tx.amountCents)}` : ''}
                      {!isWin && !isRefund ? $(tx.amountCents) : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Full transaction history ─────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-gray-900
                             border border-gray-800 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-white text-sm">{tx.description}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                        hour : '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ml-4
                    ${tx.type === 'DEPOSIT'      ? 'text-green-400'  : ''}
                    ${tx.type === 'BET_PLACED'   ? 'text-yellow-400' : ''}
                    ${tx.type === 'BET_SETTLED'  ? 'text-green-400'  : ''}
                    ${tx.type === 'BET_REFUNDED' ? 'text-blue-400'   : ''}
                  `}>
                    {tx.type === 'DEPOSIT'     ? `+${$(tx.amountCents)}` : ''}
                    {tx.type === 'BET_PLACED'  ? `-${$(tx.amountCents)}` : ''}
                    {tx.type === 'BET_SETTLED' ? `+${$(tx.amountCents)}` : ''}
                    {tx.type === 'BET_REFUNDED'? `↩ ${$(tx.amountCents)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}