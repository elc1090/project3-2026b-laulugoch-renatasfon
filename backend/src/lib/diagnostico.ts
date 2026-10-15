
export const DIMENSOES = [
  "AMBIENTAL",
  "SOCIAL",
  "ECONOMICA",
  "GOBERNANZA",
  "COMUNIDAD",
] as const;

export const PONTOS_POR_PERGUNTA = 3;

export const OPCOES_RESPOSTA = [
  { valor: 0, rotulo: "No" },
  { valor: 1, rotulo: "Ocasionalmente" },
  { valor: 2, rotulo: "Frecuentemente" },
  { valor: 3, rotulo: "Sistemáticamente" },
];

export function nivelPorPontuacao(pontuacao: number): string {
  if (pontuacao <= 25) {
    return "Inicial";
  }

  if (pontuacao <= 50) {
    return "En desarrollo";
  }

  if (pontuacao <= 75) {
    return "Avanzado";
  }

  return "Consolidado";
}

type RespostaParaCalculo = {
  valor: number;
  dimensao: string;
};

function paraEscala100(pontos: number, perguntas: number): number {
  const maximo = perguntas * PONTOS_POR_PERGUNTA;

  return maximo === 0
    ? 0
    : Math.round((pontos / maximo) * 100);
}

export function calcularResultado(
  respostas: RespostaParaCalculo[]
) {
  const pontosTotais = respostas.reduce(
    (soma, resposta) => soma + resposta.valor,
    0
  );

  const pontuacao = paraEscala100(
    pontosTotais,
    respostas.length
  );

  const dimensoes = DIMENSOES.map((dimensao) => {
    const doGrupo = respostas.filter(
      (resposta) => resposta.dimensao === dimensao
    );

    const pontos = doGrupo.reduce(
      (soma, resposta) => soma + resposta.valor,
      0
    );

    return {
      dimensao,
      pontuacao: paraEscala100(pontos, doGrupo.length),
    };
  });

  const ordenadas = [...dimensoes].sort(
    (a, b) => b.pontuacao - a.pontuacao
  );

  return {
    pontosTotais,
    pontuacao,
    nivel: nivelPorPontuacao(pontuacao),
    dimensoes,
    fortalezas: ordenadas
      .slice(0, 2)
      .map((dimensao) => dimensao.dimensao),
    areasDeMelhoria: ordenadas
      .slice(-2)
      .reverse()
      .map((dimensao) => dimensao.dimensao),
  };
}