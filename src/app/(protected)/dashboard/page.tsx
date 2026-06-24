import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Users, CreditCard, AlertCircle, TrendingUp } from 'lucide-react'
import StatCard from '@/components/StatCard'
import IngresosChart from '@/components/IngresosChart'
import { IngresosDia } from '@/types'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

async function getDashboardData(gimnaioId: string) {
  const hoy = new Date()
  const hoyStr = format(hoy, 'yyyy-MM-dd')
  const hace30Dias = format(subDays(hoy, 30), 'yyyy-MM-dd')

  const [sociosRes, pagosHoyRes, pagosVencidosRes, ingresosRes] = await Promise.all([
    supabaseAdmin.from('socios').select('id, estado').eq('gimnasio_id', gimnaioId),
    supabaseAdmin
      .from('pagos')
      .select('monto')
      .eq('gimnasio_id', gimnaioId)
      .eq('estado', 'pagado')
      .gte('fecha_pago', hoyStr)
      .lt('fecha_pago', format(subDays(hoy, -1), 'yyyy-MM-dd')),
    supabaseAdmin
      .from('pagos')
      .select('id')
      .eq('gimnasio_id', gimnaioId)
      .eq('estado', 'vencido'),
    supabaseAdmin
      .from('pagos')
      .select('monto, fecha_pago')
      .eq('gimnasio_id', gimnaioId)
      .eq('estado', 'pagado')
      .gte('fecha_pago', hace30Dias)
      .order('fecha_pago', { ascending: true }),
  ])

  const socios = sociosRes.data || []
  const totalSocios = socios.length
  const sociosActivos = socios.filter(s => s.estado === 'activo').length

  const pagosHoy = pagosHoyRes.data || []
  const ingresosHoy = pagosHoy.reduce((sum, p) => sum + (p.monto || 0), 0)

  const pagosVencidos = (pagosVencidosRes.data || []).length

  // Construir datos del gráfico (últimos 30 días)
  const ingresosMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const dia = format(subDays(hoy, i), 'dd/MM')
    ingresosMap[dia] = 0
  }

  for (const pago of (ingresosRes.data || [])) {
    if (pago.fecha_pago) {
      const dia = format(new Date(pago.fecha_pago + 'T00:00:00'), 'dd/MM')
      if (dia in ingresosMap) {
        ingresosMap[dia] = (ingresosMap[dia] || 0) + (pago.monto || 0)
      }
    }
  }

  const chartData: IngresosDia[] = Object.entries(ingresosMap).map(([dia, total]) => ({
    dia,
    total,
  }))

  const ingresosMes = (ingresosRes.data || []).reduce((sum, p) => sum + (p.monto || 0), 0)

  return { totalSocios, sociosActivos, ingresosHoy, pagosVencidos, ingresosMes, chartData }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const { totalSocios, sociosActivos, ingresosHoy, pagosVencidos, ingresosMes, chartData } =
    await getDashboardData(session.gimnaioId)

  const fechaHoy = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session.nombre}
        </h1>
        <p className="text-gray-500 mt-1 capitalize">{fechaHoy}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Socios"
          value={totalSocios}
          icon={Users}
          color="blue"
          subtitle={`${sociosActivos} activos`}
        />
        <StatCard
          title="Ingresos Hoy"
          value={`$${ingresosHoy.toLocaleString('es-AR')}`}
          icon={CreditCard}
          color="green"
          subtitle="Pagos recibidos hoy"
        />
        <StatCard
          title="Cuotas Vencidas"
          value={pagosVencidos}
          icon={AlertCircle}
          color="red"
          subtitle="Requieren atención"
        />
        <StatCard
          title="Ingresos (30 días)"
          value={`$${ingresosMes.toLocaleString('es-AR')}`}
          icon={TrendingUp}
          color="yellow"
          subtitle="Últimos 30 días"
        />
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">
          Ingresos — Últimos 30 días
        </h2>
        <IngresosChart data={chartData} />
      </div>
    </div>
  )
}
