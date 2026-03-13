// src/components/MarketFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback }                from 'react'

const CATEGORIES = [
  'All',
  'Crypto',
  'Economics',
  'Technology',
  'Politics',
  'Sports',
  'Science',
  'Entertainment',
  'Weather',
  'Other',
]

export default function MarketFilters({
  currentCategory,
  currentSearch,
}: {
  currentCategory: string
  currentSearch  : string
}) {
  const router     = useRouter()
  const searchParams = useSearchParams()

  // Update URL params without full page reload
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'All') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 when filters change
      params.delete('page')
      router.push(`/markets?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="space-y-4 mb-8">

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          🔍
        </span>
        <input
          type="text"
          defaultValue={currentSearch}
          placeholder="Search markets..."
          onChange={e => updateParam('search', e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4
                     py-2.5 text-white placeholder-gray-500 text-sm
                     focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => updateParam('category', cat)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition
              ${(currentCategory === cat) || (cat === 'All' && !currentCategory)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}