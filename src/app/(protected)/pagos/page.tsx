import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import PagosClient from './PagosClient'

async function getPagos(gimnaioId: string) {
  const { data } = await supabaseAdmin
    .from('pagos')
    .select('*, socios(nombre, apellido, telefono)')
    .eq('gimnasio_id', gimnaioId)
    .order('fecha_vencimiento', { ascending: false })

  return data || []
}

export default async function PagosPage() {
  const session = await getSession()
  if (!session) return null

  const pagos = await getPagos(session.gimnaioId)

  return <PagosClient pagosIniciales={pagos} />
}
