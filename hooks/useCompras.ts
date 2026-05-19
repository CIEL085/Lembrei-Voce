'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Compra } from '@/lib/types'

export type CompraInput = Omit<Compra, 'id' | 'conta_id' | 'user_id' | 'created_at'>

export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompras = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setCompras(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCompras()
  }, [fetchCompras])

  const getComprasByContaId = (contaId: string) =>
    compras.filter((c) => c.conta_id === contaId)

  const getTotalByContaId = (contaId: string) =>
    getComprasByContaId(contaId).reduce((sum, c) => sum + c.valor, 0)

  const totalGeral = compras.reduce((sum, c) => sum + c.valor, 0)

  const addCompra = async (contaId: string, compra: CompraInput) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const { error } = await supabase.from('compras').insert({
      ...compra,
      conta_id: contaId,
      user_id: user.id,
    })

    if (!error) await fetchCompras()
    return { error: error?.message ?? null }
  }

  const addCompras = async (contaId: string, comprasList: CompraInput[]) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const { error } = await supabase.from('compras').insert(
      comprasList.map((c) => ({ ...c, conta_id: contaId, user_id: user.id }))
    )

    if (!error) await fetchCompras()
    return { error: error?.message ?? null }
  }

  const deleteCompra = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('compras').delete().eq('id', id)
    if (!error) await fetchCompras()
    return { error: error?.message ?? null }
  }

  const atualizarCompra = async (id: string, dados: Partial<Pick<Compra, 'descricao' | 'valor' | 'parcela_atual' | 'total_parcelas'>>) => {
    const supabase = createClient()
    const { error } = await supabase.from('compras').update(dados).eq('id', id)
    if (!error) await fetchCompras()
    return { error: error?.message ?? null }
  }

  return {
    compras,
    loading,
    error,
    addCompra,
    addCompras,
    deleteCompra,
    atualizarCompra,
    getComprasByContaId,
    getTotalByContaId,
    totalGeral,
    refetch: fetchCompras,
  }
}
