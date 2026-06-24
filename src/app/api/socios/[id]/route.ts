import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'
import { registrarAuditoria } from '@/lib/auditoria'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const { data: anterior } = await supabaseAdmin
    .from('socios')
    .select('*')
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .single()

  if (!anterior) return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 })

  const { nombre, apellido, email, telefono, plan_id, estado, fecha_inicio } = body

  const { data, error } = await supabaseAdmin
    .from('socios')
    .update({ nombre, apellido, email, telefonos_whatsapp: telefono, plan_id, estado, fecha_inicio })
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await registrarAuditoria({
    gimnasio_id: session.gimnaioId,
    admin_id: session.adminId,
    accion: 'SOCIO_EDITADO',
    tabla: 'socios',
    registro_id: id,
    datos_anteriores: anterior as Record<string, unknown>,
    datos_nuevos: data as Record<string, unknown>,
  })

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { estado } = await request.json()

  const { data: anterior } = await supabaseAdmin
    .from('socios')
    .select('estado')
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .single()

  const { data, error } = await supabaseAdmin
    .from('socios')
    .update({ estado })
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await registrarAuditoria({
    gimnasio_id: session.gimnaioId,
    admin_id: session.adminId,
    accion: estado === 'activo' ? 'SOCIO_ACTIVADO' : 'SOCIO_DESACTIVADO',
    tabla: 'socios',
    registro_id: id,
    datos_anteriores: anterior as Record<string, unknown>,
    datos_nuevos: { estado },
  })

  return NextResponse.json({ data })
}
