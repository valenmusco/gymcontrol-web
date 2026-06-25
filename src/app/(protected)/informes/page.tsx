import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { format, subMonths, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp, Users, AlertCircle, DollarSign } from 'lucide-react'
import StatCard from '@/components/StatCard'
import InformesCharts from '@/components/InformesCharts'
import { IngresosMes } from '@/types'

async function getInformesData(gimnaioId: string) {
  const ahora = new Date()
  const hace6Meses = format(startOfMonth(subMonths(ahora, 5)), 'yyyy-MM-dd')

  const [pagosRes, sociosRes] = await Promise.all([
    supabaseAdmin
      .from('pagos')
      .select('monto, fecha_pago, estado, fecha_vencimiento')
      .eq('gimnasio_id', gimnaioId),
    supabaseAdmin
      .from('socios')
      .select('id, estado')
      .eq('gimnasio_id', gimnaioId),
  ])

  const pagos = pagosRes.data || []
  const socios = sociosRes.data || []

  // Socios activos vs inactivos
  const sociosActivos = socios.filter(s => s.estado === 'activo').length
  const sociosInactivos = socios.length - sociosActivos

  // Ingresos por mes (últimos 6 meses)
  const mesesMap: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const mes = format(subMonths(ahora, i), 'MMM yy', { locale: es })
    mesesMap[mes] = 0
  }

  for (const pago of pagos) {
    if (pago.estado === 'pagado' && pago.fecha_pago && pago.fecha_pago >= hace6Meses) {
      const mes = format(new Date(pago.fecha_pago + 'T00:00:00'), 'MMM yy', { locale: es })
      if (mes in mesesMap) {
        mesesMap[mes] = (mesesMap[mes] || 0) + (pago.monto || 0)
      }
    }
  }

  const ingresosMes: IngresosMes[] = Object.entries(mesesMap).map(([mes, total]) => ({
    mes,
    total,
  }))

  // Tasa de morosidad
  const totalPagos = pagos.length
  const pagosVencidos = pagos.filter(p => p.estado === 'vencido').length
  const tasaMorosidad = totalPagos > 0 ? Math.round((pagosVencidos / totalPagos) * 100) : 0

  // Ingresos acumulados del mes actual
  const mesActualStr = format(startOfMonth(ahora), 'yyyy-MM-dd')
  const ingresosMesActual = pagos
    .filter(p => p.estado === 'pagado' && p.fecha_pago && p.fecha_pago >= mesActualStr)
    .reduce((sum, p) => sum + (p.monto || 0), 0)

  // Total ingresos histórico
  const totalIngresos = pagos
    .filter(p => p.estado === 'pagado')
    .reduce((sum, p) => sum + (p.monto || 0), 0)

  return {
    sociosActivos,
    sociosInactivos,
    ingresosMes,
    tasaMorosidad,
    pagosVencidos,
    ingresosMesActual,
    totalIngresos,
    totalSocios: socios.length,
  }
}

export default async function InformesPage() {
  const session = await getSession()
  if (!session) return null

  const {
    sociosActivos,
    sociosInactivos,
    ingresosMes,
    tasaMorosidad,
    pagosVencidos,
    ingresosMesActual,
    totalIngresos,
    totalSocios,
  } = await getInformesData(session.gimnaioId)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen financiero y estadísticas del gimnasio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Ingresos del Mes"
          value={`$${ingresosMesActual.toLocaleString('es-AR')}`}
          icon={DollarSign}
          color="green"
          subtitle={format(new Date(), 'MMMM yyyy', { locale: es })}
        />
        <StatCard
          title="Total Socios"
          value={totalSocios}
          icon={Users}
          color="blue"
          subtitle={`${sociosActivos} activos, ${sociosInactivos} inactivos`}
        />
        <StatCard
          title="Tasa de Morosidad"
          value={`${tasaMorosidad}%`}
          icon={AlertCircle}
          color="red"
          subtitle={`${pagosVencidos} pagos vencidos`}
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${totalIngresos.toLocaleString('es-AR')}`}
          icon={TrendingUp}
          color="yellow"
          subtitle="Ingresos históricos"
        />
      </div>

      {/* Gráficos */}
      <InformesCharts
        ingresosMes={ingresosMes}
        sociosActivos={sociosActivos}
        sociosInactivos={sociosInactivos}
      />
    </div>
  )
}
