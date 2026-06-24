import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import PagosClient from './PagosClient'

async function getData(gimnaioId: string) {
  const [pagosRes, sociosRes] = await Promise.all([
    supabaseAdmin
      .from('pagos')
      .select('*, socios(nombre, apellido)')
      .eq('gimnasio_id', gimnaioId)
      .order('fecha_vencimiento', { ascending: false }),
    supabaseAdmin
      .from('socios')
      .select('id, nombre, apellido, gimnasio_id, estado')
      .eq('gimnasio_id', gimnaioId)
      .eq('estado', 'activo')
      .order('nombre'),
  ])

  return {
    pagos: pagosRes.data || [],
    socios: sociosRes.data || [],
  }
}

export default async function PagosPage() {
  const session = await getSession()
  if (!session) return null

  const { pagos, socios } = await getData(session.gimnaioId)

  return <PagosClient pagosIniciales={pagos} socios={socios} />
}
