'use client'

import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SaldoResumoProps {
  salario: number
  totalContas: number
}

export function SaldoResumo({ salario, totalContas }: SaldoResumoProps) {
  const saldo = salario - totalContas
  const positivo = saldo >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-violet-100 rounded-lg">
            <Wallet className="h-4 w-4 text-violet-600" />
          </div>
          <span className="text-sm text-slate-500 font-medium">Salário do mês</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{formatCurrency(salario)}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-rose-100 rounded-lg">
            <CreditCard className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-sm text-slate-500 font-medium">Total de contas</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalContas)}</p>
      </div>

      <div className={`rounded-2xl p-4 shadow-sm border ${positivo ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 rounded-lg ${positivo ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {positivo
              ? <TrendingUp className="h-4 w-4 text-emerald-600" />
              : <TrendingDown className="h-4 w-4 text-rose-500" />
            }
          </div>
          <span className={`text-sm font-medium ${positivo ? 'text-emerald-700' : 'text-rose-700'}`}>
            Saldo disponível
          </span>
        </div>
        <p className={`text-2xl font-bold ${positivo ? 'text-emerald-700' : 'text-rose-600'}`}>
          {formatCurrency(saldo)}
        </p>
      </div>
    </div>
  )
}
