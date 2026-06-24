import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { fecha_pago, metodo_pago, notas } = body

  const { data: anterior } = await supabaseAdmin
    .from('pagos')
    .select('*')
    .eq('id', id)
    .eq('gimnasio_id', session.gimnaioId)
    .single()

  if (!anterior) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
  if (anterior.estado === 'pagado') {
    return NextResponse.json({ error: 'Este pago ya fue registrado' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .update({
      estado: 'pagado',
      fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
      metodo_pago: metodo_pago || 'efectivo',
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
    accion: 'PAGO_MARCADO_COMO_PAGADO',
    tabla: 'pagos',
    registro_id: id,
    datos_anteriores: anterior as Record<string, unknown>,
    datos_nuevos: data as Record<string, unknown>,
  })

  return NextResponse.json({ data })
}
