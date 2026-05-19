'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatCurrencyInput, parseCurrency, proximoVencimento, diasParaVencer } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Conta, Compra, CategoriaType } from '@/lib/types'
import type { CompraInput } from '@/hooks/useCompras'
import { X, Trash2, Plus, Loader2, CalendarDays, Pencil, Check } from 'lucide-react'

const CATEGORIAS: CategoriaType[] = ['Cartão', 'Financiamento', 'Empréstimo', 'Assinatura', 'Outro']

type EditedCompra = {
  descricao: string
  valorDisplay: string
  valor: number
  parcela_atual: string
  total_parcelas: string
}

interface BancoModalProps {
  conta: Conta
  compras: Compra[]
  onClose: () => void
  onDeleteConta: () => Promise<void>
  onDeleteCompra: (id: string) => Promise<void>
  onAddCompra: (compra: CompraInput) => Promise<{ error: string | null }>
  onAtualizarConta: (id: string, dados: Partial<Conta>) => Promise<{ error: string | null }>
  onAtualizarCompra: (id: string, dados: Partial<Compra>) => Promise<{ error: string | null }>
}

export function BancoModal({
  conta,
  compras,
  onClose,
  onDeleteConta,
  onDeleteCompra,
  onAddCompra,
  onAtualizarConta,
  onAtualizarCompra,
}: BancoModalProps) {
  const [modoEdicao, setModoEdicao] = useState(false)
  const [editNomeBanco, setEditNomeBanco] = useState('')
  const [editCategoria, setEditCategoria] = useState<CategoriaType>('Cartão')
  const [editDiaVencimento, setEditDiaVencimento] = useState('')
  const [editCompras, setEditCompras] = useState<Record<string, EditedCompra>>({})
  const [saving, setSaving] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [valorDisplay, setValorDisplay] = useState('')
  const [parcelaAtual, setParcelaAtual] = useState('')
  const [totalParcelas, setTotalParcelas] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingConta, setDeletingConta] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const enterEditMode = () => {
    setEditNomeBanco(conta.nome_banco)
    setEditCategoria(conta.categoria)
    setEditDiaVencimento(conta.dia_vencimento != null ? String(conta.dia_vencimento) : '')
    const init: Record<string, EditedCompra> = {}
    for (const c of compras) {
      init[c.id] = {
        descricao: c.descricao,
        valorDisplay: formatCurrencyInput(String(Math.round(c.valor * 100))),
        valor: c.valor,
        parcela_atual: String(c.parcela_atual),
        total_parcelas: String(c.total_parcelas),
      }
    }
    setEditCompras(init)
    setModoEdicao(true)
  }

  const cancelEditMode = () => {
    setModoEdicao(false)
    setEditCompras({})
  }

  const handleCloseRequest = () => {
    if (modoEdicao) {
      if (window.confirm('Descartar alterações não salvas?')) {
        cancelEditMode()
        onClose()
      }
    } else {
      onClose()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (modoEdicao) {
        if (window.confirm('Descartar alterações não salvas?')) {
          setModoEdicao(false)
          setEditCompras({})
          onClose()
        }
      } else {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [modoEdicao, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target !== overlayRef.current) return
    if (modoEdicao) {
      if (window.confirm('Descartar alterações não salvas?')) {
        cancelEditMode()
        onClose()
      }
    } else {
      onClose()
    }
  }

  const updateEditCompra = (id: string, patch: Partial<EditedCompra>) => {
    setEditCompras((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const handleSave = async () => {
    setSaving(true)
    const dia = editDiaVencimento ? parseInt(editDiaVencimento) : null

    const { error: contaError } = await onAtualizarConta(conta.id, {
      nome_banco: editNomeBanco.trim() || conta.nome_banco,
      categoria: editCategoria,
      dia_vencimento: dia,
    })
    if (contaError) {
      setSaving(false)
      toast({ title: 'Erro ao salvar', description: contaError, variant: 'destructive' })
      return
    }

    for (const [id, ec] of Object.entries(editCompras)) {
      const { error } = await onAtualizarCompra(id, {
        descricao: ec.descricao.trim(),
        valor: ec.valor,
        parcela_atual: parseInt(ec.parcela_atual) || 1,
        total_parcelas: parseInt(ec.total_parcelas) || 1,
      })
      if (error) {
        setSaving(false)
        toast({ title: 'Erro ao salvar compra', description: error, variant: 'destructive' })
        return
      }
    }

    setSaving(false)
    setModoEdicao(false)
    setEditCompras({})
    toast({ title: 'Alterações salvas!' })
  }

  const handleAddCompra = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)
    const valor = parseCurrency(valorDisplay)
    if (!descricao.trim()) return setAddError('Informe a descrição.')
    if (valor <= 0) return setAddError('Informe um valor válido.')
    const pa = parseInt(parcelaAtual)
    const tp = parseInt(totalParcelas)
    if (!pa || pa < 1) return setAddError('Parcela atual inválida.')
    if (!tp || tp < 1) return setAddError('Total de parcelas inválido.')
    if (pa > tp) return setAddError('Parcela atual não pode ser maior que o total.')

    setAdding(true)
    const result = await onAddCompra({ descricao: descricao.trim(), valor, parcela_atual: pa, total_parcelas: tp })
    setAdding(false)

    if (result.error) {
      setAddError(result.error)
    } else {
      setDescricao('')
      setValorDisplay('')
      setParcelaAtual('')
      setTotalParcelas('')
      setShowAddForm(false)
    }
  }

  const handleDeleteCompra = async (id: string) => {
    setDeletingId(id)
    await onDeleteCompra(id)
    setDeletingId(null)
  }

  const handleDeleteConta = async () => {
    setDeletingConta(true)
    await onDeleteConta()
    setDeletingConta(false)
    onClose()
  }

  const total = compras.reduce((sum, c) => sum + c.valor, 0)

  const vencimentoBadge = conta.dia_vencimento != null
    ? (() => {
        const dias = diasParaVencer(conta.dia_vencimento)
        const proximo = proximoVencimento(conta.dia_vencimento)
        const dataFormatada = `${String(proximo.getDate()).padStart(2, '0')}/${String(proximo.getMonth() + 1).padStart(2, '0')}`
        if (dias <= 2) return { texto: 'Vence em breve!', classe: 'bg-rose-100 text-rose-600', data: dataFormatada }
        if (dias <= 7) return { texto: `Vencendo em ${dias} dias`, classe: 'bg-amber-100 text-amber-600', data: dataFormatada }
        return { texto: `Próxima fatura: ${dataFormatada}`, classe: 'bg-slate-100 text-slate-500', data: dataFormatada }
      })()
    : null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0 gap-3">
          <div className="flex-1 min-w-0">
            {modoEdicao ? (
              <Input
                value={editNomeBanco}
                onChange={(e) => setEditNomeBanco(e.target.value)}
                className="text-base font-bold h-9 border-violet-400 focus-visible:ring-violet-300"
                placeholder="Nome do banco"
              />
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">{conta.nome_banco}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {compras.length} {compras.length === 1 ? 'compra' : 'compras'}
                </p>
                {conta.dia_vencimento != null && vencimentoBadge && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Vence todo dia {conta.dia_vencimento}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vencimentoBadge.classe}`}>
                      {vencimentoBadge.texto}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {modoEdicao ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  aria-label="Salvar alterações"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors p-1.5 rounded-lg"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={cancelEditMode}
                  aria-label="Cancelar edição"
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={enterEditMode}
                  aria-label="Editar banco"
                  className="text-slate-400 hover:text-violet-600 transition-colors p-1.5 rounded-lg hover:bg-violet-50"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConta}
                  disabled={deletingConta}
                  aria-label="Deletar banco"
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                >
                  {deletingConta ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCloseRequest}
                  aria-label="Fechar"
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Campos de edição do banco (categoria + dia) */}
        {modoEdicao && (
          <div className="px-5 pt-3 pb-3 border-b border-slate-100 shrink-0 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Categoria</Label>
              <Select value={editCategoria} onValueChange={(v) => setEditCategoria(v as CategoriaType)}>
                <SelectTrigger className="h-8 text-sm border-violet-400 focus:ring-violet-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Dia de vencimento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={editDiaVencimento}
                onChange={(e) => setEditDiaVencimento(e.target.value)}
                className="h-8 text-sm border-violet-400 focus-visible:ring-violet-300"
                placeholder="Opcional"
              />
            </div>
          </div>
        )}

        {/* Lista de compras */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {compras.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Nenhuma compra cadastrada</p>
          ) : (
            compras.map((compra) => {
              if (modoEdicao) {
                const ec = editCompras[compra.id] ?? {
                  descricao: compra.descricao,
                  valorDisplay: formatCurrencyInput(String(Math.round(compra.valor * 100))),
                  valor: compra.valor,
                  parcela_atual: String(compra.parcela_atual),
                  total_parcelas: String(compra.total_parcelas),
                }
                return (
                  <div
                    key={compra.id}
                    className={`rounded-xl border border-violet-200 bg-violet-50/30 p-3 transition-opacity ${deletingId === compra.id ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0 space-y-2">
                        <Input
                          value={ec.descricao}
                          onChange={(e) => updateEditCompra(compra.id, { descricao: e.target.value })}
                          className="h-7 text-sm font-semibold border-violet-400 focus-visible:ring-violet-300"
                          placeholder="Descrição"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">R$</span>
                            <Input
                              className="pl-7 h-7 text-sm border-violet-400 focus-visible:ring-violet-300"
                              value={ec.valorDisplay}
                              onChange={(e) => {
                                const display = formatCurrencyInput(e.target.value)
                                updateEditCompra(compra.id, { valorDisplay: display, valor: parseCurrency(display) })
                              }}
                              inputMode="numeric"
                              placeholder="0,00"
                            />
                          </div>
                          <Input
                            type="number"
                            min={1}
                            value={ec.parcela_atual}
                            onChange={(e) => updateEditCompra(compra.id, { parcela_atual: e.target.value })}
                            className="h-7 text-sm border-violet-400 focus-visible:ring-violet-300"
                            placeholder="Parcela"
                          />
                          <Input
                            type="number"
                            min={1}
                            value={ec.total_parcelas}
                            onChange={(e) => updateEditCompra(compra.id, { total_parcelas: e.target.value })}
                            className="h-7 text-sm border-violet-400 focus-visible:ring-violet-300"
                            placeholder="Total"
                          />
                        </div>
                        <div className="flex gap-1.5 text-xs text-slate-400">
                          <span>Valor</span>
                          <span className="text-violet-300">·</span>
                          <span>Parcela</span>
                          <span className="text-violet-300">·</span>
                          <span>Total</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCompra(compra.id)}
                        disabled={deletingId === compra.id}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1 shrink-0 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              }

              const progresso = Math.round((compra.parcela_atual / compra.total_parcelas) * 100)
              const quitada = compra.parcela_atual >= compra.total_parcelas
              return (
                <div
                  key={compra.id}
                  className={`rounded-xl border p-3 transition-opacity ${deletingId === compra.id ? 'opacity-40' : ''} ${quitada ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{compra.descricao}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-bold text-slate-900">{formatCurrency(compra.valor)}</span>
                        <span className="text-xs text-slate-400">
                          parcela {compra.parcela_atual}/{compra.total_parcelas}
                        </span>
                        {quitada && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            Quitada
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCompra(compra.id)}
                      disabled={deletingId === compra.id}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Progress value={progresso} className={`h-1.5 ${quitada ? '[&>div]:bg-emerald-500' : ''}`} />
                </div>
              )
            })
          )}

          {/* Formulário de nova compra */}
          {showAddForm && (
            <form onSubmit={handleAddCompra} className="border border-violet-200 bg-violet-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-violet-700 mb-2">Nova compra</p>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Input
                  placeholder="Ex: iPhone, Geladeira..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
                    <Input
                      className="pl-7 h-8 text-sm"
                      placeholder="0,00"
                      value={valorDisplay}
                      onChange={(e) => setValorDisplay(formatCurrencyInput(e.target.value))}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Parcela</Label>
                  <Input
                    type="number" min={1} placeholder="4"
                    value={parcelaAtual}
                    onChange={(e) => setParcelaAtual(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Total</Label>
                  <Input
                    type="number" min={1} placeholder="24"
                    value={totalParcelas}
                    onChange={(e) => setTotalParcelas(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              {addError && (
                <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1">{addError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" className="flex-1 h-8 text-xs" disabled={adding}>
                  {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Salvar'}
                </Button>
                <Button
                  type="button" size="sm" variant="ghost"
                  className="h-8 text-xs text-slate-500"
                  onClick={() => { setShowAddForm(false); setAddError(null) }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-4 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Total</span>
            <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
          </div>
          {!showAddForm && (
            <Button
              variant="outline"
              className="w-full border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova compra
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
