'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { UserCircle, Bell, Loader2, AlertTriangle } from 'lucide-react'

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function formatMembroDesde(dateStr: string): string {
  const date = new Date(dateStr)
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${months[date.getMonth()]}/${date.getFullYear()}`
}

export default function PerfilPage() {
  const { profile, userEmail, loading, updateProfile } = useProfile()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [telefoneDisplay, setTelefoneDisplay] = useState('')
  const [whatsappDisplay, setWhatsappDisplay] = useState('')
  const [cpfDisplay, setCpfDisplay] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [mesmoNumero, setMesmoNumero] = useState(false)
  const [notifWhatsapp, setNotifWhatsapp] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setNome(profile.nome ?? '')
    setTelefoneDisplay(profile.telefone ? formatPhone(profile.telefone) : '')
    setWhatsappDisplay(profile.whatsapp ? formatPhone(profile.whatsapp) : '')
    setCpfDisplay(profile.cpf ? formatCPF(profile.cpf) : '')
    setDataNascimento(profile.data_nascimento ?? '')
    setNotifWhatsapp(profile.notif_whatsapp ?? true)
    if (profile.telefone && profile.whatsapp && profile.telefone === profile.whatsapp) {
      setMesmoNumero(true)
    }
  }, [profile])

  const handleTelefoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setTelefoneDisplay(formatted)
    if (mesmoNumero) setWhatsappDisplay(formatted)
  }

  const handleMesmoNumeroChange = (checked: boolean) => {
    setMesmoNumero(checked)
    if (checked) setWhatsappDisplay(telefoneDisplay)
  }

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe seu nome completo.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const { error } = await updateProfile({
      nome: nome.trim(),
      telefone: stripNonDigits(telefoneDisplay) || null,
      whatsapp: stripNonDigits(whatsappDisplay) || null,
      cpf: stripNonDigits(cpfDisplay) || null,
      data_nascimento: dataNascimento || null,
      notif_whatsapp: notifWhatsapp,
    })
    setSaving(false)
    if (error) {
      toast({ title: 'Erro ao salvar', description: error, variant: 'destructive' })
    } else {
      toast({ title: 'Perfil atualizado!' })
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    )
  }

  const iniciais = getInitials(nome || profile?.nome || '?')
  const whatsappDigits = stripNonDigits(whatsappDisplay)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <UserCircle className="h-5 w-5 text-violet-600" />
          <h1 className="text-xl font-bold text-slate-900">Meu Perfil</h1>
        </div>
        <p className="text-slate-500 text-sm">Gerencie suas informações pessoais</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card esquerdo: avatar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center gap-3">
          <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-violet-700">{iniciais}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-lg leading-tight">
              {nome || profile?.nome || '—'}
            </p>
            <p className="text-sm text-slate-500 mt-0.5 break-all">{userEmail}</p>
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
            Conta ativa
          </span>
          {profile?.created_at && (
            <p className="text-xs text-slate-400">
              Membro desde {formatMembroDesde(profile.created_at)}
            </p>
          )}
        </div>

        {/* Card direito: formulário */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nome">
                Nome completo <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(99) 99999-9999"
                value={telefoneDisplay}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="(99) 99999-9999"
                value={whatsappDisplay}
                onChange={(e) => setWhatsappDisplay(formatPhone(e.target.value))}
                inputMode="numeric"
                disabled={mesmoNumero}
              />
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-violet-600 h-3.5 w-3.5 accent-violet-600"
                  checked={mesmoNumero}
                  onChange={(e) => handleMesmoNumeroChange(e.target.checked)}
                />
                <span className="text-xs text-slate-500">Mesmo número do telefone</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cpf">
                CPF{' '}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="cpf"
                placeholder="999.999.999-99"
                value={cpfDisplay}
                onChange={(e) => setCpfDisplay(formatCPF(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dataNascimento">
                Data de nascimento{' '}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </div>
      </div>

      {/* Card de notificações */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-violet-100 rounded-lg">
            <Bell className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Preferências de notificação</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Receber lembretes de vencimento via WhatsApp
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Você receberá uma mensagem 2 dias antes do vencimento de cada fatura
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifWhatsapp}
              onClick={() => setNotifWhatsapp((v) => !v)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                notifWhatsapp ? 'bg-violet-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  notifWhatsapp ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!whatsappDigits && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Cadastre seu WhatsApp acima para receber notificações
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
