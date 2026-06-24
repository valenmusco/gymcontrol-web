import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { socio_id, monto, mes_cobrado, fecha_vencimiento, estado, metodo_pago, notas } = body

  if (!socio_id || !monto || !fecha_vencimiento) {
    return NextResponse.json({ error: 'socio_id, monto y fecha_vencimiento son requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .insert({
      gimnasio_id: session.gimnasioId,
      socio_id,
      monto: Number(monto),
      mes_cobrado: mes_cobrado || null,
      fecha_vencimiento,
      estado: estado || 'pendiente',
      metodo_pago: metodo_pago || null,
      notas: notas || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await registrarAuditoria({
    gimnasio_id: session.gimnasioId,
    admin_id: session.adminId,
    accion: 'PAGO_CREADO',
    tabla: 'pagos',
    registro_id: data.id,
    datos_nuevos: data as Record<string, unknown>,
  })

  return NextResponse.json({ data }, { status: 201 })
}
