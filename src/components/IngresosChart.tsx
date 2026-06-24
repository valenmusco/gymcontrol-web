'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { IngresosDia } from '@/types'

interface IngresosChartProps {
  data: IngresosDia[]
}

export default function IngresosChart({ data }: IngresosChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos de ingresos en los últimos 30 días
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `$${v}`} />
        <Tooltip
          formatter={(value: unknown) => [`$${Number(value).toLocaleString('es-AR')}`, 'Ingresos']}
          labelStyle={{ color: '#374151' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#colorIngresos)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
