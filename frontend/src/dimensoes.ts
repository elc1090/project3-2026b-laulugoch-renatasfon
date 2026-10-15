
import type { Dimensao } from './types'

export const NOME_DIMENSAO: Record<Dimensao, string> = {
  AMBIENTAL: 'Ambiental',
  SOCIAL: 'Social',
  ECONOMICA: 'Econômica',
  GOBERNANZA: 'Governança',
  COMUNIDAD: 'Comunidade',
}

export const ENFOQUE_NIVEL: Record<string, string> = {
  Inicial:
    'É o momento de identificar prioridades e começar a implementar práticas sustentáveis.',
  'En desarrollo':
    'A empresa já apresenta algumas práticas, mas ainda pode fortalecê-las.',
  Avanzado:
    'A empresa apresenta avanços importantes na incorporação da sustentabilidade.',
  Consolidado:
    'A empresa incorpora práticas sustentáveis de forma sistemática.',
}