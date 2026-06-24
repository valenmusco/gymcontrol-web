import { supabaseAdmin } from './supabase-admin'

interface AuditoriaPayload {
  gimnasio_id: string
  admin_id: string
  accion: string
  tabla: string
  registro_id: string
  datos_anteriores?: Record<string, unknown>
  datos_nuevos?: Record<string, unknown>
}

export async function registrarAuditoria(payload: AuditoriaPayload): Promise<void> {
  try {
    await supabaseAdmin.from('auditoria').insert(payload)
  } catch {
    // La auditoría nunca debe interrumpir la operación principal
  }
}
