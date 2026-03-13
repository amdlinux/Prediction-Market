// src/components/NewMarketForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// The categories users can pick from
const CATEGORIES = [
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

export default function NewMarketForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    title      : '',
    description: '',
    category   : 'Crypto',
    closingDate: '',
    liquidityB : 100,
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'liquidityB' ? Number(value) : value,
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/markets', {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'x-admin-secret': 'supersecret123', //hard coded the secret - for testing - need to remove this!!!!
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(
          typeof data.error === 'string'
            ? data.error
            : 'Validation failed — check all fields'
        )
        return
      }

      // Go straight to the new market's page
      router.push(`/markets/${data.market.id}`)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Minimum closing date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

      {/* Title */}
      <div>
        <label className="block text-sm text-gray-300 mb-1.5 font-medium">
          Market Question *
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Will Bitcoin exceed $150,000 before January 2026?"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                     text-white placeholder-gray-500 text-sm focus:outline-none
                     focus:border-indigo-500 transition"
        />
        <p className="text-gray-500 text-xs mt-1">
          Write as a clear YES/NO question. Min 10 characters.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-300 mb-1.5 font-medium">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Resolution criteria: This market resolves YES if..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                     text-white placeholder-gray-500 text-sm focus:outline-none
                     focus:border-indigo-500 transition resize-none"
        />
        <p className="text-gray-500 text-xs mt-1">
          Explain exactly how this market will be resolved.
        </p>
      </div>

      {/* Category + Closing date side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5 font-medium">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                       text-white text-sm focus:outline-none focus:border-indigo-500 transition"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5 font-medium">
            Closing Date *
          </label>
          <input
            type="date"
            name="closingDate"
            value={form.closingDate}
            min={minDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                       text-white text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Liquidity parameter */}
      <div>
        <label className="block text-sm text-gray-300 mb-1.5 font-medium">
          Liquidity (b = {form.liquidityB})
        </label>
        <input
          type="range"
          name="liquidityB"
          min={10}
          max={500}
          step={10}
          value={form.liquidityB}
          onChange={handleChange}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10 — very sensitive (prices move fast)</span>
          <span>500 — very stable (prices move slowly)</span>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          With b={form.liquidityB}, buying 10 contracts moves the price by roughly{' '}
          {Math.round((10 / form.liquidityB) * 25)}¢.
          Leave at 100 unless you have a specific reason.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800
                      rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !form.title || !form.closingDate}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                   disabled:cursor-not-allowed text-white font-semibold py-3
                   rounded-lg transition"
      >
        {loading ? 'Creating...' : 'Create Market'}
      </button>
    </div>
  )
}