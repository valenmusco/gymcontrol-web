import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Socio } from '@/types'
import PagosClient from './PagosClient'

async function getData(gimnasioId: string) {
  const [pagosRes, sociosRes] = await Promise.all([
    supabaseAdmin
      .from('pagos')
      .select('*, socios(nombre, apellido)')
      .eq('gimnasio_id', gimnasioId)
      .order('fecha_vencimiento', { ascending: false }),
    supabaseAdmin
      .from('socios')
      .select('id, nombre, apellido, gimnasio_id, estado, telefonos_whatsapp, fecha_inicio')
      .eq('gimnasio_id', gimnasioId)
      .eq('estado', 'activo')
      .order('nombre'),
  ])

  return {
    pagos: pagosRes.data || [],
    socios: (sociosRes.data || []) as Socio[],
  }
}

export default async function PagosPage() {
  const session = await getSession()
  if (!session) return null

  const { pagos, socios } = await getData(session.gimnasioId)

  return <PagosClient pagosIniciales={pagos} socios={socios} />
}
