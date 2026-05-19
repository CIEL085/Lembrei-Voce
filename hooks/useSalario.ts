'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { getMesReferencia } from '@/lib/utils'
import type { Salario } from '@/lib/types'

export function useSalario() {
  const [salarios, setSalarios] = useState<Salario[]>([])
  const [salarioAtual, setSalarioAtual] = useState<Salario | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSalarios = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('salarios')
      .select('*')
      .order('mes_referencia', { ascending: false })

    const list = data ?? []
    setSalarios(list)

    const mesAtual = getMesReferencia()
    setSalarioAtual(list.find((s) => s.mes_referencia === mesAtual) ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSalarios()
  }, [fetchSalarios])

  const salvarSalario = async (valor: number, mes_referencia: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const { error } = await supabase.from('salarios').upsert(
      { user_id: user.id, valor, mes_referencia },
      { onConflict: 'user_id,mes_referencia' }
    )

    if (!error) await fetchSalarios()
    return { error: error?.message ?? null }
  }

  const deletarSalario = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('salarios').delete().eq('id', id)
    if (!error) await fetchSalarios()
    return { error: error?.message ?? null }
  }

  return { salarios, salarioAtual, loading, salvarSalario, deletarSalario, refetch: fetchSalarios }
}
