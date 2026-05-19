import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const number = parseInt(digits) / 100
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}

export function getMesReferencia(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatMesReferencia(mesReferencia: string): string {
  const [year, month] = mesReferencia.split('-')
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${months[parseInt(month) - 1]} ${year}`
}

export function getCategoriaBadgeColor(categoria: string): string {
  const colors: Record<string, string> = {
    'Cartão': 'bg-violet-100 text-violet-700',
    'Financiamento': 'bg-amber-100 text-amber-700',
    'Empréstimo': 'bg-rose-100 text-rose-700',
    'Assinatura': 'bg-emerald-100 text-emerald-700',
    'Outro': 'bg-slate-100 text-slate-700',
  }
  return colors[categoria] ?? 'bg-slate-100 text-slate-700'
}

export function proximoVencimento(dia: number): Date {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDay = today.getDate()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const effectiveDia = Math.min(dia, daysInMonth)

  if (effectiveDia >= todayDay) {
    return new Date(year, month, effectiveDia)
  }

  const nextMonth = (month + 1) % 12
  const nextYear = month === 11 ? year + 1 : year
  const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate()
  return new Date(nextYear, nextMonth, Math.min(dia, daysInNextMonth))
}

export function diasParaVencer(dia: number): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const proximo = proximoVencimento(dia)
  proximo.setHours(0, 0, 0, 0)
  return Math.round((proximo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getMesesDisponiveis(): { value: string; label: string }[] {
  const meses = []
  const now = new Date()
  for (let i = -2; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    meses.push({
      value: getMesReferencia(d),
      label: formatMesReferencia(getMesReferencia(d)),
    })
  }
  return meses
}
