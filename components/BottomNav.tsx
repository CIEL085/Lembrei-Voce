'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, List, DollarSign, Calculator, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/adicionar', label: 'Adicionar', icon: PlusCircle },
  { href: '/dashboard/contas', label: 'Contas', icon: List },
  { href: '/dashboard/salario', label: 'Salário', icon: DollarSign },
  { href: '/dashboard/calculo', label: 'Cálculo', icon: Calculator },
  { href: '/dashboard/perfil', label: 'Perfil', icon: UserCircle },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0',
                active ? 'text-violet-600' : 'text-slate-400'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className={cn('text-[10px] font-medium truncate', active ? 'text-violet-600' : 'text-slate-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
