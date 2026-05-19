'use client'

import { useState } from 'react'
import { useSalario } from '@/hooks/useSalario'
import { useCompras } from '@/hooks/useCompras'
import { SaldoResumo } from '@/components/SaldoResumo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatCurrencyInput, parseCurrency, getMesReferencia, formatMesReferencia, getMesesDisponiveis } from '@/lib/utils'
import { DollarSign, Loader2, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function SalarioPage() {
  const { salarios, salarioAtual, loading: loadingSalario, salvarSalario, deletarSalario } = useSalario()
  const { totalGeral: totalContas } = useCompras()

  const meses = getMesesDisponiveis()
  const [valorDisplay, setValorDisplay] = useState('')
  const [mesRef, setMesRef] = useState(getMesReferencia())
  const [saving, setSaving] = useState(false)
  const [savedThisSession, setSavedThisSession] = useState(false)

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValorDisplay(formatCurrencyInput(e.target.value))
  }

  const handleSalvar = async () => {
    const valor = parseCurrency(valorDisplay)
    if (valor <= 0) {
      toast({ title: 'Informe um valor válido', variant: 'destructive' })
      return
    }
    setSaving(true)
    const result = await salvarSalario(valor, mesRef)
    setSaving(false)
    if (!result.error) {
      setSavedThisSession(true)
      setValorDisplay('')
      toast({ title: 'Salário salvo!', description: `${formatMesReferencia(mesRef)} atualizado.`, variant: 'success' as never })
    }
  }

  const handleDelete = async (id: string) => {
    await deletarSalario(id)
    toast({ title: 'Salário removido' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-5 w-5 text-violet-600" />
          <h1 className="text-xl font-bold text-slate-900">Salário Atual</h1>
        </div>
        <p className="text-slate-500 text-sm">Informe seu salário mensal para calcular o saldo</p>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Mês de referência</Label>
            <Select value={mesRef} onValueChange={setMesRef}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Valor do salário</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">R$</span>
              <Input
                className="pl-9"
                placeholder="0,00"
                value={valorDisplay}
                onChange={handleValorChange}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSalvar} className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar salário'}
        </Button>
      </div>

      {/* Resumo rápido após salvar */}
      {(savedThisSession || salarioAtual) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-700">Resumo do mês atual</h2>
          </div>
          <SaldoResumo salario={salarioAtual?.valor ?? 0} totalContas={totalContas} />
        </div>
      )}

      {/* Histórico */}
      {!loadingSalario && salarios.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico de salários</h2>
          <div className="space-y-2">
            {salarios.map((s) => {
              const isMesAtual = s.mes_referencia === getMesReferencia()
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${isMesAtual ? 'bg-violet-50 border-violet-200' : 'bg-white border-slate-200'}`}
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{formatMesReferencia(s.mes_referencia)}</p>
                    {isMesAtual && <span className="text-xs text-violet-600 font-medium">Mês atual</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{formatCurrency(s.valor)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 h-8 w-8"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
