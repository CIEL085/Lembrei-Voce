'use client'

import { useSalario } from '@/hooks/useSalario'
import { useContas } from '@/hooks/useContas'
import { useCompras } from '@/hooks/useCompras'
import { formatCurrency, getCategoriaBadgeColor } from '@/lib/utils'
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2, DollarSign } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function CalculoPage() {
  const { salarioAtual, loading: loadingSalario } = useSalario()
  const { contas, loading: loadingContas } = useContas()
  const { compras, loading: loadingCompras, getTotalByContaId, totalGeral } = useCompras()

  const loading = loadingSalario || loadingContas || loadingCompras

  const salario = salarioAtual?.valor ?? 0
  const totalContas = totalGeral
  const saldo = salario - totalContas
  const percentualComprometido = salario > 0 ? Math.round((totalContas / salario) * 100) : 0
  const alerta = percentualComprometido > 30

  const pieData = [
    { name: 'Contas', value: Math.min(totalContas, salario) },
    { name: 'Disponível', value: Math.max(0, saldo) },
  ].filter((d) => d.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="h-5 w-5 text-violet-600" />
          <h1 className="text-xl font-bold text-slate-900">O que vai sobrar?</h1>
        </div>
        <p className="text-slate-500 text-sm">Veja o impacto das suas contas no salário</p>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500 text-sm">Salário do mês</span>
          <span className="font-bold text-slate-900">{formatCurrency(salario)}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500 text-sm">Total de contas</span>
          <span className="font-bold text-rose-500">- {formatCurrency(totalContas)}</span>
        </div>
        <div className={`flex items-center justify-between py-3 px-4 rounded-xl ${saldo >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex items-center gap-2">
            {saldo >= 0
              ? <TrendingUp className="h-4 w-4 text-emerald-600" />
              : <TrendingDown className="h-4 w-4 text-rose-500" />
            }
            <span className={`font-semibold text-sm ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              Saldo disponível
            </span>
          </div>
          <span className={`text-xl font-bold ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {formatCurrency(saldo)}
          </span>
        </div>
      </div>

      {/* Alerta */}
      {salario > 0 && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${alerta ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          {alerta
            ? <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            : <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${alerta ? 'text-amber-700' : 'text-emerald-700'}`}>
              {percentualComprometido}% do salário comprometido
            </p>
            <p className={`text-xs mt-0.5 ${alerta ? 'text-amber-600' : 'text-emerald-600'}`}>
              {alerta
                ? 'Atenção! Mais de 30% do seu salário está comprometido com contas. Considere revisar seus gastos.'
                : 'Ótimo! Você está dentro do limite recomendado de 30% para compromissos fixos.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {salario > 0 && pieData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Distribuição do salário</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === 'Disponível' ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detalhamento por banco */}
      {contas.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Detalhamento por banco</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {contas.map((conta) => {
              const totalConta = getTotalByContaId(conta.id)
              const comprasDoConta = compras.filter((c) => c.conta_id === conta.id)
              return (
                <div key={conta.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${getCategoriaBadgeColor(conta.categoria)}`}>
                      {conta.categoria}
                    </span>
                    <span className="text-sm text-slate-700 truncate">{conta.nome_banco}</span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {comprasDoConta.length} compra{comprasDoConta.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 text-sm shrink-0 ml-2">{formatCurrency(totalConta)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {salario === 0 && (
        <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Cadastre seu salário em <span className="font-medium text-violet-500">Salário</span> para ver o cálculo</p>
        </div>
      )}
    </div>
  )
}
