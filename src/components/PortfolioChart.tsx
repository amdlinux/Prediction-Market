// src/components/PortfolioChart.tsx
'use client'

import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts'

type Snapshot = {
  valueCents: number
  createdAt : Date
}

export default function PortfolioChart({
  snapshots,
}: {
  snapshots: Snapshot[]
}) {
  if (snapshots.length < 2) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-sm font-medium mb-2">Portfolio Value</p>
        <p className="text-gray-500 text-sm text-center py-8">
          Come back tomorrow to see your performance chart.
        </p>
      </div>
    )
  }

  const data = snapshots.map(s => ({
    date : new Date(s.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    }),
    value: s.valueCents / 100,
  }))

  const first = data[0].value
  const last  = data[data.length - 1].value
  const up    = last >= first

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm font-medium">Portfolio Value Over Time</p>
        <p className={`text-sm font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
          {up ? '+' : '−'}${Math.abs(last - first).toFixed(2)}
          {' '}since start
        </p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={up ? '#22c55e' : '#ef4444'}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={up ? '#22c55e' : '#ef4444'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={v => `$${v}`}
            width={50}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v: unknown) => {
              const num = Number(v ?? 0);
              return [`$${num.toFixed(2)}`, 'Portfolio Value'];
            }}
            contentStyle={{
              background  : '#111827',
              border      : '1px solid #374151',
              borderRadius: '8px',
              fontSize    : '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={up ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            fill="url(#portfolioGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}