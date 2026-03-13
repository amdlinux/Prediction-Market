// src/app/admin/page.tsx
import { db }          from '@/lib/db'
import AdminMarketList from '@/components/AdminMarketList'
import Link            from 'next/link'

export default async function AdminPage() {
  const markets = await db.market.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin — Market Management</h1>
            <p className="text-gray-400 text-sm">
              Create, resolve, or void markets.
            </p>
          </div>
          <Link
            href="/admin/markets/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white
                       px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Market
          </Link>
        </div>

        <AdminMarketList markets={markets} />
      </div>
    </div>
  )
}