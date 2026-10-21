export type TamanhoEmpresa = 'MICRO' | 'PEQUENA' | 'MEDIA'

export type Usuario = {
  id: number
  nomeEmpresa: string
  email: string
  createdAt: string
  tamanho?: TamanhoEmpresa | null
  numFuncionarios?: number | null
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

export type AcaoPlano = {
  titulo: string
  descricao: string
  indicador: string
  ods: number[]
}

export type ItemPlano = {
  dimensao: Dimensao
  pontuacao: number
  situacao: 'ACAO' | 'REFORCO'
  acao?: AcaoPlano
  reforco?: { titulo: string; descricao: string }
}

export type Plano = {
  diagnosticoId: number
  createdAt: string
  dimensoes: ItemPlano[]
}