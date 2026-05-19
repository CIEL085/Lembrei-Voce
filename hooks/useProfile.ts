'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    setUserEmail(user.email ?? '')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) setError(error.message)
    else setProfile(data as Profile)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (dados: ProfileUpdate) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const { error } = await supabase
      .from('profiles')
      .update(dados)
      .eq('user_id', user.id)

    if (!error) await fetchProfile()
    return { error: error?.message ?? null }
  }

  return { profile, userEmail, loading, error, updateProfile, refetch: fetchProfile }
}
