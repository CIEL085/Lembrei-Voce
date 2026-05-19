export type CategoriaType =
  | 'Cartão'
  | 'Financiamento'
  | 'Empréstimo'
  | 'Assinatura'
  | 'Outro'

export interface Profile {
  id: string
  user_id: string
  nome: string
  telefone: string | null
  whatsapp: string | null
  cpf: string | null
  data_nascimento: string | null
  avatar_url: string | null
  notif_whatsapp: boolean
  created_at: string
}

export interface Conta {
  id: string
  user_id: string
  nome_banco: string
  categoria: CategoriaType
  dia_vencimento: number | null
  created_at: string
}

export interface Compra {
  id: string
  conta_id: string
  user_id: string
  descricao: string
  valor: number
  parcela_atual: number
  total_parcelas: number
  created_at: string
}

export interface Salario {
  id: string
  user_id: string
  valor: number
  mes_referencia: string
  created_at: string
}

export interface ResumoFinanceiro {
  salario: number
  totalContas: number
  saldoDisponivel: number
  percentualComprometido: number
}
