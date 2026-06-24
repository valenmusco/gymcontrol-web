'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Pago, Socio } from '@/types'

interface PagoModalProps {
  open: boolean
  pago?: Pago | null
  socios: Socio[]
  onClose: () => void
  onSave: () => void
}

const estadoOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'vencido', label: 'Vencido' },
]

const metodoPagoOptions = ['efectivo', 'tarjeta de débito', 'tarjeta de crédito', 'transferencia', 'otro']

export default function PagoModal({ open, pago, socios, onClose, onSave }: PagoModalProps) {
  const [form, setForm] = useState({
    socio_id: '',
    monto: '',
    mes_cobrado: new Date().toISOString().substring(0, 7) + '-01',
    fecha_vencimiento: '',
    estado: 'pendiente',
    metodo_pago: '',
    notas: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (pago) {
      setForm({
        socio_id: String(pago.socio_id || ''),
        monto: String(pago.monto || ''),
        mes_cobrado: pago.mes_cobrado || '',
        fecha_vencimiento: pago.fecha_vencimiento || '',
        estado: pago.estado || 'pendiente',
        metodo_pago: pago.metodo_pago || '',
        notas: pago.notas || '',
      })
    } else {
      setForm({
        socio_id: '',
        monto: '',
        mes_cobrado: new Date().toISOString().substring(0, 7) + '-01',
        fecha_vencimiento: '',
        estado: 'pendiente',
        metodo_pago: '',
        notas: '',
      })
    }
    setError('')
  }, [pago, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = pago ? `/api/pagos/${pago.id}` : '/api/pagos'
      const method = pago ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: Number(form.monto) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      onSave()
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {pago ? 'Editar Pago' : 'Nuevo Pago'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Socio *</label>
            <select
              required
              value={form.socio_id}
              onChange={e => setForm({ ...form, socio_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccionar socio...</option>
              {socios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.apellido || ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.monto}
                onChange={e => setForm({ ...form, monto: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {estadoOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes cobrado</label>
              <input
                type="date"
                value={form.mes_cobrado}
                onChange={e => setForm({ ...form, mes_cobrado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
              <input
                type="date"
                required
                value={form.fecha_vencimiento}
                onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {form.estado === 'pagado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
              <select
                value={form.metodo_pago}
                onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Sin especificar</option>
                {metodoPagoOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input
              type="text"
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Observaciones opcionales..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {pago ? 'Guardar Cambios' : 'Crear Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
