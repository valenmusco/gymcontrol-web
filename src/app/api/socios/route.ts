import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'
import { registrarAuditoria } from '@/lib/auditoria'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const busqueda = searchParams.get('q') || ''

  let query = supabaseAdmin
    .from('socios')
    .select('*, planes(nombre, precio_mensual)')
    .eq('gimnasio_id', session.gimnasioId)
    .order('created_at', { ascending: false })

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { nombre, apellido, email, telefono, plan_id, estado, fecha_inicio } = body

  if (!nombre || !estado) {
    return NextResponse.json({ error: 'Nombre y estado son requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('socios')
    .insert({
      gimnasio_id: session.gimnasioId,
      nombre,
      apellido: apellido || null,
      email: email || null,
      telefonos_whatsapp: telefono || null,
      plan_id: plan_id || null,
      estado: estado || 'activo',
      fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await registrarAuditoria({
    gimnasio_id: session.gimnasioId,
    admin_id: session.adminId,
    accion: 'SOCIO_CREADO',
    tabla: 'socios',
    registro_id: data.id,
    datos_nuevos: data as Record<string, unknown>,
  })

  return NextResponse.json({ data }, { status: 201 })
}
