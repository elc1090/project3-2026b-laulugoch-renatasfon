import type { Dimensao } from './types'

export const DIMENSOES_ATIVAS: Dimensao[] = ['AMBIENTAL', 'SOCIAL', 'ECONOMICA']

export function ehDimensaoAtiva(dimensao: string): dimensao is Dimensao {
  return (DIMENSOES_ATIVAS as string[]).includes(dimensao)
}

export const NOME_DIMENSAO: Record<Dimensao, string> = {
  AMBIENTAL: 'Ambiental',
  SOCIAL: 'Social',
  ECONOMICA: 'Económica',
}

// Limite abaixo do qual a dimensão gera tarefa no "Meu Plano"
export const LIMITE_PLANO = 60

export type NivelEcoSME = 'Inicial' | 'En desarrollo' | 'Avanzado'

// Regra textual da escala nova: 0-39, 40-69, 70-100
export function nivelPorPontuacao(pontuacao: number): NivelEcoSME {
  if (pontuacao >= 70) return 'Avanzado'
  if (pontuacao >= 40) return 'En desarrollo'
  return 'Inicial'
}

export const ENFOQUE_NIVEL: Record<NivelEcoSME, string> = {
  Inicial:
    'Requiere comenzar con acciones básicas y priorizadas.',
  'En desarrollo':
    'Existen algunas prácticas sostenibles, pero necesitan fortalecerse.',
  Avanzado:
    'La empresa presenta avances importantes en sostenibilidad.',
}