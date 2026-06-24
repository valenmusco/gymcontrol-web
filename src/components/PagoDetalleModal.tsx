'use client'

import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { Pago, Socio } from '@/types'

interface PagoDetalleModalProps {
  pago: Pago | null
  onClose: () => void
  onPagado: () => void
}

const metodoPagoOptions = ['efectivo', 'tarjeta de débito', 'tarjeta de crédito', 'transferencia', 'otro']

export default function PagoDetalleModal({ pago, onClose, onPagado }: PagoDetalleModalProps) {
  const [marcandoPago, setMarcandoPago] = useState(false)
  const [form, setForm] = useState({ fecha_pago: new Date().toISOString().split('T')[0], metodo_pago: 'efectivo', notas: '' })
  const [error, setError] = useState('')

  if (!pago) return null

  const socio = pago.socios as Socio | undefined

  async function handlePagar() {
    setMarcandoPago(true)
    setError('')
    try {
      const res = await fetch(`/api/pagos/${pago!.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrar el pago')
        return
      }
      onPagado()
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setMarcandoPago(false)
    }
  }

  const estadoColor: Record<string, string> = {
    pagado: 'bg-green-100 text-green-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    vencido: 'bg-red-100 text-red-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Detalle del Pago</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Socio</span>
            <span className="font-medium text-gray-900">
              {socio?.nombre} {socio?.apellido || ''}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Monto</span>
            <span className="font-bold text-gray-900 text-base">
              ${pago.monto?.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Vencimiento</span>
            <span className="text-gray-900">
              {new Date(pago.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">Estado</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor[pago.estado]}`}>
              {pago.estado}
            </span>
          </div>
          {pago.fecha_pago && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fecha de pago</span>
              <span className="text-gray-900">
                {new Date(pago.fecha_pago + 'T00:00:00').toLocaleDateString('es-AR')}
              </span>
            </div>
          )}
          {pago.metodo_pago && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Método</span>
              <span className="text-gray-900 capitalize">{pago.metodo_pago}</span>
            </div>
          )}
          {pago.notas && (
            <div className="text-sm">
              <span className="text-gray-500">Notas: </span>
              <span className="text-gray-900">{pago.notas}</span>
            </div>
          )}
        </div>

        {pago.estado !== 'pagado' && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Registrar Pago</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha de pago</label>
                <input
                  type="date"
                  value={form.fecha_pago}
                  onChange={e => setForm({ ...form, fecha_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Método</label>
                <select
                  value={form.metodo_pago}
                  onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {metodoPagoOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notas (opcional)</label>
              <input
                type="text"
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Observaciones..."
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              onClick={handlePagar}
              disabled={marcandoPago}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              {marcandoPago ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Marcar como Pagado
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
