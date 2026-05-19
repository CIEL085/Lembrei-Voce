'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export async function signUp(nome: string, email: string, senha: string, whatsapp: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  })

  if (error) {
    const msg = error.message === 'User already registered'
      ? 'Este email já está cadastrado.'
      : 'Erro ao criar conta. Tente novamente.'
    return { error: msg }
  }

  if (data.user) {
    await supabase
      .from('profiles')
      .update({ whatsapp, telefone: whatsapp })
      .eq('user_id', data.user.id)
  }

  return { error: null }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return { user, loading, logout }
}
