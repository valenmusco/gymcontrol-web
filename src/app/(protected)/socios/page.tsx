import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SociosClient from './SociosClient'

async function getData(gimnaioId: string) {
  const [sociosRes, planesRes] = await Promise.all([
    supabaseAdmin
      .from('socios')
      .select('*, planes(nombre, precio_mensual)')
      .eq('gimnasio_id', gimnaioId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('planes')
      .select('*')
      .eq('gimnasio_id', gimnaioId)
      .eq('estado', 'activo'),
  ])

  return {
    socios: sociosRes.data || [],
    planes: planesRes.data || [],
  }
}

export default async function SociosPage() {
  const session = await getSession()
  if (!session) return null

  const { socios, planes } = await getData(session.gimnaioId)

  return <SociosClient sociosIniciales={socios} planes={planes} />
}
