// src/components/PriceChart.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type ChartPoint = { trade: number; yes: number; no: number }

export default function PriceChart({ marketId }: { marketId: string }) {
  const [data, setData] = useState<ChartPoint[]>([])

  useEffect(() => {
    fetch(`/api/markets/${marketId}/history`)
      .then(r => r.json())
      .then(d => setData(d.chartData ?? []))
  }, [marketId])

  if (data.length <= 1) {
    return (
      <p className="text-gray-500 text-xs text-center py-4">
        No trades yet — price starts at 50¢
      </p>
    )
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-500 mb-2">YES price history</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <XAxis
            dataKey="trade"
            hide
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={v => `${v}¢`}
            width={35}
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <Tooltip
            formatter={(value) => [`${value}¢`, 'YES price']}
            labelFormatter={label => `Trade #${label}`}
            contentStyle={{
              background: '#111827',
              border     : '1px solid #374151',
              borderRadius: '8px',
              fontSize   : '12px',
            }}
          />
          <ReferenceLine y={50} stroke="#374151" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="yes"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}