'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrencyInput, parseCurrency } from '@/lib/utils'
import type { CategoriaType } from '@/lib/types'
import type { CompraInput } from '@/hooks/useCompras'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface CompraRow extends CompraInput {
  _key: number
  valorDisplay: string
}

interface ContaFormProps {
  onSubmit: (
    banco: { nome_banco: string; categoria: CategoriaType; dia_vencimento: number | null },
    compras: CompraInput[]
  ) => Promise<{ error: string | null }>
}

const CATEGORIAS: CategoriaType[] = ['Cartão', 'Financiamento', 'Empréstimo', 'Assinatura', 'Outro']

let _keyCounter = 0
const newCompraRow = (): CompraRow => ({
  _key: ++_keyCounter,
  descricao: '',
  valor: 0,
  valorDisplay: '',
  parcela_atual: 1,
  total_parcelas: 1,
})

export function ContaForm({ onSubmit }: ContaFormProps) {
  const [nomeBanco, setNomeBanco] = useState('')
  const [categoria, setCategoria] = useState<CategoriaType>('Cartão')
  const [diaVencimento, setDiaVencimento] = useState('')
  const [compras, setCompras] = useState<CompraRow[]>([newCompraRow()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateCompra = (key: number, patch: Partial<CompraRow>) => {
    setCompras((prev) => prev.map((c) => (c._key === key ? { ...c, ...patch } : c)))
  }

  const handleValorChange = (key: number, raw: string) => {
    const display = formatCurrencyInput(raw)
    const valor = parseCurrency(display)
    updateCompra(key, { valorDisplay: display, valor })
  }

  const addCompra = () => setCompras((prev) => [...prev, newCompraRow()])

  const removeCompra = (key: number) => {
    setCompras((prev) => prev.filter((c) => c._key !== key))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nomeBanco.trim()) return setError('Informe o nome do banco.')
    if (compras.length === 0) return setError('Adicione ao menos uma compra.')

    for (const c of compras) {
      if (!c.descricao.trim()) return setError('Informe a descrição de cada compra.')
      if (c.valor <= 0) return setError('Informe um valor válido em cada compra.')
      if (c.parcela_atual < 1) return setError('Parcela atual inválida.')
      if (c.total_parcelas < 1) return setError('Total de parcelas inválido.')
      if (c.parcela_atual > c.total_parcelas) return setError('Parcela atual não pode ser maior que o total.')
    }

    setLoading(true)
    const dia = diaVencimento ? parseInt(diaVencimento) : null
    const result = await onSubmit(
      { nome_banco: nomeBanco.trim(), categoria, dia_vencimento: dia },
      compras.map(({ descricao, valor, parcela_atual, total_parcelas }) => ({
        descricao,
        valor,
        parcela_atual,
        total_parcelas,
      }))
    )
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setNomeBanco('')
      setCategoria('Cartão')
      setDiaVencimento('')
      setCompras([newCompraRow()])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Banco */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nomeBanco">Nome do banco / credor</Label>
          <Input
            id="nomeBanco"
            placeholder="Ex: Nubank, Itaú..."
            value={nomeBanco}
            onChange={(e) => setNomeBanco(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaType)}>
            <SelectTrigger id="categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="diaVencimento">
            Dia de vencimento da fatura{' '}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="diaVencimento"
            type="number"
            min={1}
            max={31}
            placeholder="Ex: 10"
            value={diaVencimento}
            onChange={(e) => setDiaVencimento(e.target.value)}
            className="max-w-[140px]"
          />
        </div>
      </div>

      {/* Compras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-slate-700">Compras</Label>
          <button
            type="button"
            onClick={addCompra}
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar compra
          </button>
        </div>

        <div className="space-y-3">
          {compras.map((compra, idx) => (
            <div key={compra._key} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Compra {idx + 1}</span>
                {compras.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompra(compra._key)}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    placeholder="Ex: Geladeira, iPhone..."
                    value={compra.descricao}
                    onChange={(e) => updateCompra(compra._key, { descricao: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
                    <Input
                      className="pl-8 h-8 text-sm"
                      placeholder="0,00"
                      value={compra.valorDisplay}
                      onChange={(e) => handleValorChange(compra._key, e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Parcela atual</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Ex: 4"
                      value={compra.parcela_atual || ''}
                      onChange={(e) => updateCompra(compra._key, { parcela_atual: parseInt(e.target.value) || 1 })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Ex: 24"
                      value={compra.total_parcelas || ''}
                      onChange={(e) => updateCompra(compra._key, { total_parcelas: parseInt(e.target.value) || 1 })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : 'Salvar conta'}
      </Button>
    </form>
  )
}
