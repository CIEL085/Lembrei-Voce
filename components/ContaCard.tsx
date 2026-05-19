'use client'

import { Progress } from '@/components/ui/progress'
import { formatCurrency, getCategoriaBadgeColor, diasParaVencer } from '@/lib/utils'
import type { Conta, Compra } from '@/lib/types'
import { ChevronRight, CalendarDays } from 'lucide-react'

interface ContaCardProps {
  conta: Conta
  compras: Compra[]
  onClick: () => void
}

export function ContaCard({ conta, compras, onClick }: ContaCardProps) {
  const total = compras.reduce((sum, c) => sum + c.valor, 0)
  const progressoMedio =
    compras.length > 0
      ? Math.round(
          compras.reduce((sum, c) => sum + c.parcela_atual / c.total_parcelas, 0) / compras.length * 100
        )
      : 0
  const todasQuitadas = compras.length > 0 && compras.every((c) => c.parcela_atual >= c.total_parcelas)

  const vencimentoInfo = conta.dia_vencimento != null
    ? (() => {
        const dias = diasParaVencer(conta.dia_vencimento)
        const cor = dias <= 2
          ? 'text-rose-500'
          : dias <= 7
          ? 'text-amber-500'
          : 'text-slate-400'
        return { dias, cor }
      })()
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
        todasQuitadas ? 'border-emerald-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{conta.nome_banco}</h3>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(total)}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoriaBadgeColor(conta.categoria)}`}>
          {conta.categoria}
        </span>
        {todasQuitadas ? (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Quitada
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {compras.length} {compras.length === 1 ? 'compra' : 'compras'} · {formatCurrency(total)}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <Progress value={progressoMedio} className={todasQuitadas ? '[&>div]:bg-emerald-500' : ''} />
        <p className="text-xs text-slate-400 text-right">{progressoMedio}% concluído</p>
      </div>

      {vencimentoInfo && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${vencimentoInfo.cor}`}>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>Vence dia {conta.dia_vencimento}</span>
        </div>
      )}
    </button>
  )
}
