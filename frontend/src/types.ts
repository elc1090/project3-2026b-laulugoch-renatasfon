export type Usuario = {
  id: number
  nomeEmpresa: string
  email: string
  createdAt: string
}

export type Dimensao =
  | 'AMBIENTAL'
  | 'SOCIAL'
  | 'ECONOMICA'

export type Pergunta = {
  id: string
  dimensao: Dimensao
  ordem: number
  texto: string
}

export type OpcaoResposta = {
  valor: number
  rotulo: string
}

export type Resultado = {
  id: number
  createdAt: string
  pontosTotais: number
  pontuacao: number
  nivel: string
  dimensoes: { dimensao: Dimensao; pontuacao: number }[]
  fortalezas: Dimensao[]
  areasDeMelhoria: Dimensao[]
}

export type Tarefa = {
  id: number
  dimensao: Dimensao
  titulo: string
  descricao?: string
  status?: string
}