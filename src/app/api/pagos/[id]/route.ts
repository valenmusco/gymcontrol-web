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
    .from('pagos')
    .select('*')
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .single()

  if (!anterior) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })

  const { socio_id, monto, mes_cobrado, fecha_vencimiento, estado, metodo_pago, notas } = body

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .update({
      socio_id,
      monto: Number(monto),
      mes_cobrado: mes_cobrado || null,
      fecha_vencimiento,
      estado,
      metodo_pago: metodo_pago || null,
      notas: notas || null,
    })
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await registrarAuditoria({
    gimnasio_id: session.gimnaioId,
    admin_id: session.adminId,
    accion: 'PAGO_EDITADO',
    tabla: 'pagos',
    registro_id: id,
    datos_anteriores: anterior as Record<string, unknown>,
    datos_nuevos: data as Record<string, unknown>,
  })

  return NextResponse.json({ data })
}
