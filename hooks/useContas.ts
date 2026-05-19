'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Conta } from '@/lib/types'

export function useContas() {
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContas = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contas')
      .select('id, user_id, nome_banco, categoria, dia_vencimento, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setContas(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchContas()
  }, [fetchContas])

  const adicionarConta = async (conta: Pick<Conta, 'nome_banco' | 'categoria' | 'dia_vencimento'>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado', data: null }

    const { data, error } = await supabase
      .from('contas')
      .insert({ ...conta, user_id: user.id })
      .select()
      .single()

    if (!error) await fetchContas()
    return { error: error?.message ?? null, data: data as Conta | null }
  }

  const deletarConta = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('contas').delete().eq('id', id)
    if (!error) await fetchContas()
    return { error: error?.message ?? null }
  }

  const atualizarConta = async (id: string, dados: Partial<Pick<Conta, 'nome_banco' | 'categoria' | 'dia_vencimento'>>) => {
    const supabase = createClient()
    const { error } = await supabase.from('contas').update(dados).eq('id', id)
    if (!error) await fetchContas()
    return { error: error?.message ?? null }
  }

  return { contas, loading, error, adicionarConta, deletarConta, atualizarConta, refetch: fetchContas }
}
