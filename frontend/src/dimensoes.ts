import type { Dimensao } from './types'

export const DIMENSOES_ATIVAS: Dimensao[] = ['AMBIENTAL', 'SOCIAL', 'ECONOMICA']

export function ehDimensaoAtiva(dimensao: string): dimensao is Dimensao {
  return (DIMENSOES_ATIVAS as string[]).includes(dimensao)
}

export const NOME_DIMENSAO: Record<Dimensao, string> = {
  AMBIENTAL: 'Ambiental',
  SOCIAL: 'Social',
  ECONOMICA: 'Econômica',
}

// Limite abaixo do qual a dimensão gera tarefa no "Meu Plano"
export const LIMITE_PLANO = 60

export type NivelEcoSME = 'Inicial' | 'Em Desenvolvimento' | 'Avançado'

// Regra textual da escala nova: 0-39, 40-69, 70-100
export function nivelPorPontuacao(pontuacao: number): NivelEcoSME {
  if (pontuacao >= 70) return 'Avançado'
  if (pontuacao >= 40) return 'Em Desenvolvimento'
  return 'Inicial'
}

export const ENFOQUE_NIVEL: Record<NivelEcoSME, string> = {
  Inicial:
    'É o momento de identificar prioridades e começar a implementar práticas sustentáveis.',
  'Em Desenvolvimento':
    'A empresa já apresenta algumas práticas, mas ainda pode fortalecê-las.',
  Avançado:
    'A empresa apresenta avanços importantes na incorporação da sustentabilidade.',
}