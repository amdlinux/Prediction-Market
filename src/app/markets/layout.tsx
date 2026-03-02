// src/app/markets/layout.tsx
import WalletBar  from '@/components/WalletBar'
import { UserButton } from '@clerk/nextjs'
import Link       from 'next/link'

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Top navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">Kalshi</h1>
        <div className="flex items-center gap-4">
          <Link href="/markets"   className="text-gray-400 hover:text-white text-sm">Markets</Link>
          <Link href="/portfolio" className="text-gray-400 hover:text-white text-sm">Portfolio</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Wallet strip — shows on every markets page */}
      <WalletBar />

      {children}
    </div>
  )
}