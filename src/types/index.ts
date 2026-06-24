export interface Admin {
  id: string
  email: string
  password?: string
  password_hash?: string
  nombre: string
  apellido?: string
  gimnasio_id: string
  rol?: string
  activo?: boolean
  created_at?: string
}

export interface Gimnasio {
  id: string
  nombre: string
  direccion?: string
  telefono?: string
  email?: string
}

export interface Plan {
  id: string
  gimnasio_id: string
  nombre: string
  descripcion?: string
  precio_mensual: number
  duracion_dias?: number
  estado?: string
}

export interface Socio {
  id: string
  gimnasio_id: string
  nombre: string
  apellido?: string
  email?: string
  telefonos_whatsapp?: string
  plan_id?: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  fecha_inicio?: string
  fecha_fin?: string
  created_at?: string
  planes?: Plan
}

export interface Pago {
  id: string
  socio_id: string
  gimnasio_id: string
  monto: number
  mes_cobrado?: string
  fecha_vencimiento: string
  fecha_pago?: string | null
  estado: 'pendiente' | 'pagado' | 'vencido'
  metodo_pago?: string
  notas?: string
  created_at?: string
  socios?: Socio
}

export interface Auditoria {
  id?: string
  gimnasio_id: string
  admin_id: string
  accion: string
  tabla: string
  registro_id: string
  datos_anteriores?: Record<string, unknown>
  datos_nuevos?: Record<string, unknown>
  ip?: string
  created_at?: string
}

export interface SessionPayload {
  adminId: string
  email: string
  gimnasioId: string
  nombre: string
  iat?: number
  exp?: number
}

export interface DashboardStats {
  totalSocios: number
  sociosActivos: number
  pagosHoy: number
  pagosVencidos: number
  ingresosHoy: number
  ingresosMes: number
}

export interface IngresosDia {
  dia: string
  total: number
}

export interface IngresosMes {
  mes: string
  total: number
}
