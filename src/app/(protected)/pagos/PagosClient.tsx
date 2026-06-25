'use client'

import { useState, useMemo } from 'react'
import { CreditCard, Eye, CheckCircle, Filter } from 'lucide-react'
import { Pago, Socio } from '@/types'
import PagoDetalleModal from '@/components/PagoDetalleModal'

interface PagosClientProps {
  pagosIniciales: Pago[]
}

const estadoOpciones = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'vencido', label: 'Vencido' },
]

const estadoBadge: Record<string, string> = {
  pagado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  vencido: 'bg-red-100 text-red-700',
}

function getMeses() {
  const meses = []
  const ahora = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    meses.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
    })
  }
  return meses
}

export default function PagosClient({ pagosIniciales }: PagosClientProps) {
  const [pagos, setPagos] = useState<Pago[]>(pagosIniciales)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [mesFiltro, setMesFiltro] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null)
  const meses = getMeses()

  const pagosFiltrados = useMemo(() => {
    return pagos.filter(p => {
      const socio = p.socios as Socio | undefined
      const nombreSocio = `${socio?.nombre || ''} ${socio?.apellido || ''}`.toLowerCase()

      if (estadoFiltro && p.estado !== estadoFiltro) return false
      if (mesFiltro && !p.fecha_vencimiento?.startsWith(mesFiltro)) return false
      if (busqueda && !nombreSocio.includes(busqueda.toLowerCase())) return false

      return true
    })
  }, [pagos, estadoFiltro, mesFiltro, busqueda])

  async function recargarPagos() {
    const res = await fetch('/api/pagos-list')
    if (res.ok) {
      const data = await res.json()
      if (data.data) setPagos(data.data)
    } else {
      // Recargar la página como fallback
      window.location.reload()
    }
  }

  const totalesPorEstado = useMemo(() => ({
    pendiente: pagos.filter(p => p.estado === 'pendiente').length,
    pagado: pagos.filter(p => p.estado === 'pagado').length,
    vencido: pagos.filter(p => p.estado === 'vencido').length,
  }), [pagos])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-7 h-7" /> Pagos
        </h1>
        <div className="flex gap-4 mt-2">
          <span className="text-sm text-yellow-600 font-medium">{totalesPorEstado.pendiente} pendientes</span>
          <span className="text-sm text-green-600 font-medium">{totalesPorEstado.pagado} pagados</span>
          <span className="text-sm text-red-600 font-medium">{totalesPorEstado.vencido} vencidos</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={estadoFiltro}
            onChange={e => setEstadoFiltro(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            {estadoOpciones.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <select
          value={mesFiltro}
          onChange={e => setMesFiltro(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        >
          <option value="">Todos los meses</option>
          {meses.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar socio..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 min-w-48"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {pagosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron pagos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Socio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vencimiento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagosFiltrados.map(pago => {
                  const socio = pago.socios as Socio | undefined
                  return (
                    <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {socio?.nombre} {socio?.apellido || ''}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ${pago.monto?.toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(pago.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge[pago.estado]}`}>
                          {pago.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPagoSeleccionado(pago)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {pago.estado !== 'pagado' && (
                            <button
                              onClick={() => setPagoSeleccionado(pago)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle/pago */}
      <PagoDetalleModal
        pago={pagoSeleccionado}
        onClose={() => setPagoSeleccionado(null)}
        onPagado={recargarPagos}
      />
    </div>
  )
}
