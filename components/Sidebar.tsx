'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  DollarSign,
  Calculator,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard/adicionar', label: 'Adicionar Conta', icon: PlusCircle },
  { href: '/dashboard/contas', label: 'Minhas Contas', icon: List },
  { href: '/dashboard/salario', label: 'Salário', icon: DollarSign },
  { href: '/dashboard/calculo', label: 'O que vai sobrar?', icon: Calculator },
  { href: '/dashboard/perfil', label: 'Perfil', icon: UserCircle },
]

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface SidebarProps {
  nomeUsuario?: string
}

export function Sidebar({ nomeUsuario }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const iniciais = nomeUsuario ? getInitials(nomeUsuario) : '?'

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-200 p-4">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight">Lembrei Você</h1>
            <p className="text-xs text-slate-400">Controle financeiro</p>
          </div>
        </div>
      </div>

      {nomeUsuario && (
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-violet-700">{iniciais}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{nomeUsuario}</p>
            <p className="text-xs text-slate-400">Olá!</p>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-violet-600' : 'text-slate-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors mt-2"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </aside>
  )
}
