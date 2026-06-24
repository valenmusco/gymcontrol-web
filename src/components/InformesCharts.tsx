'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { IngresosMes } from '@/types'

interface InformesChartsProps {
  ingresosMes: IngresosMes[]
  sociosActivos: number
  sociosInactivos: number
}

const COLORS = ['#2563EB', '#9ca3af']

export default function InformesCharts({ ingresosMes, sociosActivos, sociosInactivos }: InformesChartsProps) {
  const sociosData = [
    { name: 'Activos', value: sociosActivos },
    { name: 'Inactivos', value: sociosInactivos },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Ingresos por mes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-6">Ingresos — Últimos 6 meses</h3>
        {ingresosMes.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Sin datos de ingresos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ingresosMes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `$${v}`} />
              <Tooltip
                formatter={(v: unknown) => [`$${Number(v).toLocaleString('es-AR')}`, 'Ingresos']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Socios activos vs inactivos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-6">Socios Activos vs Inactivos</h3>
        {(sociosActivos + sociosInactivos) === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Sin socios registrados
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sociosData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {sociosData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
