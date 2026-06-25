import { createClient } from '@supabase/supabase-js'

// Los ?? evitan crash durante el build de Next.js cuando las env vars
// no están disponibles aún. En runtime de Vercel, los valores reales
// siempre están presentes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-key'

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
