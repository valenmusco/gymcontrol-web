'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, Users, CreditCard, BarChart3, LogOut } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/socios', label: 'Socios', icon: Users },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/informes', label: 'Informes', icon: BarChart3 },
]

interface SidebarProps {
  adminNombre: string
  adminEmail: string
}

export default function Sidebar({ adminNombre, adminEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">GymControl</p>
            <p className="text-slate-400 text-xs">Administración</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario y Logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="mb-3 px-3">
          <p className="text-white text-sm font-medium truncate">{adminNombre}</p>
          <p className="text-slate-400 text-xs truncate">{adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
        </button>
      </div>
    </aside>
  )
}
