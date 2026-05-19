'use client'

import { useState, useEffect } from 'react'
import { ContaForm } from '@/components/ContaForm'
import { ContaCard } from '@/components/ContaCard'
import { BancoModal } from '@/components/BancoModal'
import { FloatingCards } from '@/components/FloatingCards'
import { useContas } from '@/hooks/useContas'
import { useCompras } from '@/hooks/useCompras'
import { toast } from '@/hooks/use-toast'
import { PlusCircle, Loader2 } from 'lucide-react'
import type { Conta, Compra, CategoriaType } from '@/lib/types'
import type { CompraInput } from '@/hooks/useCompras'

export default function AdicionarPage() {
  const { contas, loading: loadingContas, adicionarConta, deletarConta, atualizarConta } = useContas()
  const { loading: loadingCompras, addCompras, addCompra, deleteCompra, atualizarCompra, getComprasByContaId } = useCompras()
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null)

  const loading = loadingContas || loadingCompras

  useEffect(() => {
    if (!selectedConta) return
    const fresh = contas.find((c) => c.id === selectedConta.id)
    if (fresh && fresh !== selectedConta) setSelectedConta(fresh)
  }, [contas])

  const handleSubmit = async (
    banco: { nome_banco: string; categoria: CategoriaType; dia_vencimento: number | null },
    compras: CompraInput[]
  ) => {
    const { error, data } = await adicionarConta(banco)
    if (error || !data) return { error: error ?? 'Erro ao salvar banco.' }

    const { error: comprasError } = await addCompras(data.id, compras)
    if (comprasError) return { error: comprasError }

    toast({
      title: 'Conta salva!',
      description: `${banco.nome_banco} adicionada com ${compras.length} compra(s).`,
      variant: 'success' as never,
    })
    return { error: null }
  }

  const handleDeleteConta = async () => {
    if (!selectedConta) return
    await deletarConta(selectedConta.id)
    setSelectedConta(null)
    toast({ title: 'Banco removido' })
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
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f3ff 100%)' }}
    >
      <FloatingCards />

      <div className="relative z-10 max-w-2xl mx-auto space-y-8 py-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="h-5 w-5 text-violet-600" />
            <h1 className="text-xl font-bold text-slate-900">Contas para Lembrar</h1>
          </div>
          <p className="text-slate-500 text-sm">Adicione seus bancos e as compras de cada um</p>
        </div>

        {/* Formulário com glassmorphism */}
        <div
          className="rounded-2xl shadow-xl p-6"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <ContaForm onSubmit={handleSubmit} />
        </div>

        {/* Lista de bancos cadastrados */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          </div>
        ) : contas.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <PlusCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma conta cadastrada ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contas.map((conta) => (
              <ContaCard
                key={conta.id}
                conta={conta}
                compras={getComprasByContaId(conta.id)}
                onClick={() => setSelectedConta(conta)}
              />
            ))}
          </div>
        )}
      </div>

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
