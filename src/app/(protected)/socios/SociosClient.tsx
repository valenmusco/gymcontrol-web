'use client'

import { useState, useMemo } from 'react'
import { Users, Plus, Search, Edit2, UserCheck, UserX } from 'lucide-react'
import { Socio, Plan } from '@/types'
import SocioModal from '@/components/SocioModal'
import ConfirmModal from '@/components/ConfirmModal'

interface SociosClientProps {
  sociosIniciales: Socio[]
  planes: Plan[]
}

const estadoBadge: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-gray-100 text-gray-600',
  suspendido: 'bg-red-100 text-red-700',
}

export default function SociosClient({ sociosIniciales, planes }: SociosClientProps) {
  const [socios, setSocios] = useState<Socio[]>(sociosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [socioEditar, setSocioEditar] = useState<Socio | null>(null)
  const [confirmacion, setConfirmacion] = useState<{
    open: boolean; socio: Socio | null; nuevoEstado: string
  }>({ open: false, socio: null, nuevoEstado: '' })
  const [loadingAccion, setLoadingAccion] = useState(false)

  const sociosFiltrados = useMemo(() => {
    if (!busqueda) return socios
    const q = busqueda.toLowerCase()
    return socios.filter(s =>
      s.nombre?.toLowerCase().includes(q) ||
      s.apellido?.toLowerCase().includes(q) ||
      s.telefono?.includes(q)
    )
  }, [socios, busqueda])

  async function recargarSocios() {
    const res = await fetch('/api/socios')
    const data = await res.json()
    if (data.data) setSocios(data.data)
  }

  async function cambiarEstado() {
    if (!confirmacion.socio) return
    setLoadingAccion(true)
    try {
      await fetch(`/api/socios/${confirmacion.socio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: confirmacion.nuevoEstado }),
      })
      await recargarSocios()
    } finally {
      setLoadingAccion(false)
      setConfirmacion({ open: false, socio: null, nuevoEstado: '' })
    }
  }

  function abrirEditar(socio: Socio) {
    setSocioEditar(socio)
    setModalAbierto(true)
  }

  function abrirNuevo() {
    setSocioEditar(null)
    setModalAbierto(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7" /> Socios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {socios.length} socios registrados · {socios.filter(s => s.estado === 'activo').length} activos
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Socio
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o teléfono..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {sociosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron socios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Inicio</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sociosFiltrados.map(socio => (
                  <tr key={socio.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {socio.nombre} {socio.apellido || ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{socio.telefono || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {(socio.planes as Plan | undefined)?.nombre || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge[socio.estado] || 'bg-gray-100 text-gray-600'}`}>
                        {socio.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {socio.fecha_inicio
                        ? new Date(socio.fecha_inicio + 'T00:00:00').toLocaleDateString('es-AR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(socio)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {socio.estado === 'activo' ? (
                          <button
                            onClick={() => setConfirmacion({ open: true, socio, nuevoEstado: 'inactivo' })}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desactivar"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmacion({ open: true, socio, nuevoEstado: 'activo' })}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activar"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal socio */}
      <SocioModal
        open={modalAbierto}
        socio={socioEditar}
        planes={planes}
        onClose={() => setModalAbierto(false)}
        onSave={recargarSocios}
      />

      {/* Modal confirmación */}
      <ConfirmModal
        open={confirmacion.open}
        title={confirmacion.nuevoEstado === 'activo' ? 'Activar Socio' : 'Desactivar Socio'}
        message={`¿Estás seguro de que querés ${
          confirmacion.nuevoEstado === 'activo' ? 'activar' : 'desactivar'
        } a ${confirmacion.socio?.nombre} ${confirmacion.socio?.apellido || ''}?`}
        confirmLabel={confirmacion.nuevoEstado === 'activo' ? 'Sí, activar' : 'Sí, desactivar'}
        danger={confirmacion.nuevoEstado !== 'activo'}
        loading={loadingAccion}
        onConfirm={cambiarEstado}
        onCancel={() => setConfirmacion({ open: false, socio: null, nuevoEstado: '' })}
      />
    </div>
  )
}
