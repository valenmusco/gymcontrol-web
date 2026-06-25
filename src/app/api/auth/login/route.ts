import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSession, COOKIE_NAME } from '@/lib/session'
import { Admin } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    // Buscar admin en la tabla administradores
    const { data: admin, error } = await supabaseAdmin
      .from('administradores')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !admin) {
      return NextResponse.json({
        error: 'Credenciales incorrectas',
        _debug: error?.message ?? 'admin no encontrado',
        _url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        _key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }, { status: 401 })
    }

    const adminData = admin as Admin

    // Verificar que el admin esté activo (si el campo existe)
    if (adminData.activo === false) {
      return NextResponse.json({ error: 'Cuenta desactivada. Contacte al soporte.' }, { status: 403 })
    }

    // Obtener el campo de contraseña (soporte para distintos nombres de columna)
    const storedPassword = adminData.password_hash || adminData.password
    if (!storedPassword) {
      return NextResponse.json({ error: 'Configuración de cuenta incorrecta' }, { status: 500 })
    }

    // Verificar contraseña (bcrypt o texto plano)
    let passwordValid = false
    if (storedPassword.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, storedPassword)
    } else {
      passwordValid = storedPassword === password
    }

    if (!passwordValid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    // Obtener gimnasio_id (soporte para distintos nombres de columna)
    const gimnaioId = adminData.gimnasio_id

    // Crear sesión JWT
    const token = await createSession({
      adminId: adminData.id,
      email: adminData.email,
      gimnaioId: gimnaioId,
      nombre: adminData.nombre,
    })

    const response = NextResponse.json({
      success: true,
      admin: {
        id: adminData.id,
        email: adminData.email,
        nombre: adminData.nombre,
      },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Error en login:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
