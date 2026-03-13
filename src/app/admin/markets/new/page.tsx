// src/app/admin/markets/new/page.tsx
import NewMarketForm from '@/components/NewMarketForm'

export default function NewMarketPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a
            href="/admin"
            className="text-gray-500 hover:text-gray-300 text-sm transition"
        >
            ← Back to admin
          </a>
        </div>
        <h1 className="text-2xl font-bold mb-2">Create New Market</h1>
        <p className="text-gray-400 text-sm mb-8">
          New markets open immediately and accept bets until the closing date.
        </p>
        <NewMarketForm />
      </div>
    </div>
  )
}