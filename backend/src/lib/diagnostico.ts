export const DIMENSOES = ["AMBIENTAL", "SOCIAL", "ECONOMICA"] as const;

export const PONTOS_POR_PERGUNTA = 10;

// Abaixo desta nota a dimensão recebe uma tarefa corretiva no plano de ação
export const LIMITE_PLANO = 60;

export const OPCOES_RESPOSTA = [
  { valor: 10, rotulo: "Sí, completamente" },
  { valor: 5, rotulo: "Parcialmente / En proceso" },
  { valor: 0, rotulo: "No" },
];

export const VALORES_VALIDOS = OPCOES_RESPOSTA.map((opcao) => opcao.valor);

export function nivelPorPontuacao(pontuacao: number): string {
  if (pontuacao <= 39) return "Inicial";
  if (pontuacao <= 69) return "En desarrollo";
  return "Avanzado";
}

type RespostaParaCalculo = { valor: number; dimensao: string };

function paraEscala100(pontos: number, perguntas: number): number {
  const maximo = perguntas * PONTOS_POR_PERGUNTA;
  return maximo === 0 ? 0 : Math.round((pontos / maximo) * 100);
}

export function calcularResultado(respostas: RespostaParaCalculo[]) {
  const pontosTotais = respostas.reduce((soma, r) => soma + r.valor, 0);
  const pontuacao = paraEscala100(pontosTotais, respostas.length);

  const dimensoes = DIMENSOES.map((dimensao) => {
    const doGrupo = respostas.filter((r) => r.dimensao === dimensao);
    const pontos = doGrupo.reduce((soma, r) => soma + r.valor, 0);
    return { dimensao, pontuacao: paraEscala100(pontos, doGrupo.length) };
  });

  const fortalezas = dimensoes
    .filter((d) => d.pontuacao >= LIMITE_PLANO)
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .map((d) => d.dimensao);

  const areasDeMelhoria = dimensoes
    .filter((d) => d.pontuacao < LIMITE_PLANO)
    .sort((a, b) => a.pontuacao - b.pontuacao)
    .map((d) => d.dimensao);

  return {
    pontosTotais,
    pontuacao,
    nivel: nivelPorPontuacao(pontuacao),
    dimensoes,
    fortalezas,
    areasDeMelhoria,
  };
}