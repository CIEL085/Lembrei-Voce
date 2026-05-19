import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { LogOut, LayoutDashboard } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome')
    .eq('user_id', user.id)
    .single()

  const nomeUsuario = profile?.nome ?? user.email ?? 'Usuário'
  const primeiroNome = nomeUsuario.split(' ')[0]

  return (
    <div className="flex min-h-screen">
      <Sidebar nomeUsuario={nomeUsuario} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Lembrei Você</span>
          </div>
          <span className="text-sm text-slate-500">Olá, <span className="font-semibold text-slate-900">{primeiroNome}</span></span>
        </header>

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
