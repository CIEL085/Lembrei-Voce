'use client'

import { useState, useEffect } from 'react'
import { useContas } from '@/hooks/useContas'
import { useCompras } from '@/hooks/useCompras'
import { ContaCard } from '@/components/ContaCard'
import { BancoModal } from '@/components/BancoModal'
import { formatCurrency } from '@/lib/utils'
import { List, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Conta, Compra, CategoriaType } from '@/lib/types'
import type { CompraInput } from '@/hooks/useCompras'

const CATEGORIAS: CategoriaType[] = ['Cartão', 'Financiamento', 'Empréstimo', 'Assinatura', 'Outro']

export default function ContasPage() {
  const { contas, loading: loadingContas, deletarConta, atualizarConta } = useContas()
  const { loading: loadingCompras, addCompra, deleteCompra, atualizarCompra, getComprasByContaId, getTotalByContaId, totalGeral } = useCompras()
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null)

  const loading = loadingContas || loadingCompras

  // Sync selectedConta with fresh data after updates
  useEffect(() => {
    if (!selectedConta) return
    const fresh = contas.find((c) => c.id === selectedConta.id)
    if (fresh && fresh !== selectedConta) setSelectedConta(fresh)
  }, [contas])

  const contasFiltradas = contas.filter((c) =>
    filtroCategoria === 'todos' || c.categoria === filtroCategoria
  )

  const totalFiltrado = contasFiltradas.reduce((sum, c) => sum + getTotalByContaId(c.id), 0)

  const handleDeleteConta = async () => {
    if (!selectedConta) return
    await deletarConta(selectedConta.id)
    setSelectedConta(null)
  }

  const handleDeleteCompra = async (id: string) => {
    await deleteCompra(id)
  }

  const handleAddCompra = async (compra: CompraInput) => {
    if (!selectedConta) return { error: 'Nenhum banco selecionado' }
    return addCompra(selectedConta.id, compra)
  }

  const handleAtualizarConta = async (id: string, dados: Partial<Conta>) => {
    return atualizarConta(id, dados)
  }

  const handleAtualizarCompra = async (id: string, dados: Partial<Compra>) => {
    return atualizarCompra(id, dados)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <List className="h-5 w-5 text-violet-600" />
          <h1 className="text-xl font-bold text-slate-900">Minhas Contas</h1>
        </div>
        <p className="text-slate-500 text-sm">Visualize e gerencie seus bancos e compras</p>
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-3">
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="flex-1 max-w-xs">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {CATEGORIAS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : contasFiltradas.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <List className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma conta encontrada</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contasFiltradas.map((conta) => (
              <ContaCard
                key={conta.id}
                conta={conta}
                compras={getComprasByContaId(conta.id)}
                onClick={() => setSelectedConta(conta)}
              />
            ))}
          </div>

          {/* Rodapé totalizador */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              {contasFiltradas.length} banco{contasFiltradas.length !== 1 ? 's' : ''}
              {filtroCategoria !== 'todos' && (
                <span className="text-slate-400"> (filtrados de {contas.length})</span>
              )}
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total</span>
              <span className="font-bold text-slate-900">{formatCurrency(totalFiltrado)}</span>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalhes do banco */}
      {selectedConta && (
        <BancoModal
          conta={selectedConta}
          compras={getComprasByContaId(selectedConta.id)}
          onClose={() => setSelectedConta(null)}
          onDeleteConta={handleDeleteConta}
          onDeleteCompra={handleDeleteCompra}
          onAddCompra={handleAddCompra}
          onAtualizarConta={handleAtualizarConta}
          onAtualizarCompra={handleAtualizarCompra}
        />
      )}
    </div>
  )
}
