import {
  NOME_DIMENSAO,
  ENFOQUE_NIVEL,
  LIMITE_PLANO,
  ehDimensaoAtiva,
  nivelPorPontuacao,
} from '../dimensoes'
import type { Resultado } from '../types'
import '../diagnostico.css'

type Props = {
  resultado: Resultado
  gerandoPlano: boolean
  erroPlano: string
  onGerarPlano: () => void
  onNovoDiagnostico: () => void
  onVoltar: () => void
}

function ResultadoDiagnostico({
  resultado,
  gerandoPlano,
  erroPlano,
  onGerarPlano,
  onNovoDiagnostico,
  onVoltar,
}: Props) {
  // Nível calculado pela escala nova (0-39, 40-69, 70-100)
  const nivel = nivelPorPontuacao(resultado.pontuacao)

  const dimensoes = resultado.dimensoes.filter((item) =>
    ehDimensaoAtiva(item.dimensao),
  )
  const fortalezas = resultado.fortalezas.filter(ehDimensaoAtiva)
  const areasDeMelhoria = resultado.areasDeMelhoria.filter(ehDimensaoAtiva)

  const dimensoesAbaixoDoLimite = dimensoes.filter(
    (item) => item.pontuacao < LIMITE_PLANO,
  ).length

  return (
    <div className="diagnostico-container">
      <header className="resultado-cabecalho">
        <p>Diagnóstico de sustentabilidade</p>
        <h1>Resultado da avaliação</h1>
        <p>
          Sua empresa obteve uma pontuação de{' '}
          <strong>{resultado.pontuacao}/100</strong>.
        </p>
      </header>

      <section className="resultado-nivel">
        <span>Nível de sustentabilidade</span>
        <h2>{nivel}</h2>
        <p>{ENFOQUE_NIVEL[nivel]}</p>
      </section>

      <section className="resultado-dimensoes">
        <h2>Pontuação por dimensão</h2>

        {dimensoes.map((item) => (
          <article className="dimensao-resultado" key={item.dimensao}>
            <div className="dimensao-resultado-cabecalho">
              <span>{NOME_DIMENSAO[item.dimensao]}</span>
              <strong>{item.pontuacao}/100</strong>
            </div>

            <progress value={item.pontuacao} max={100} />
          </article>
        ))}
      </section>

      <section className="resultado-destaques">
        <div>
          <h2>Fortalezas</h2>
          {fortalezas.length > 0 ? (
            <ul>
              {fortalezas.map((dimensao) => (
                <li key={dimensao}>{NOME_DIMENSAO[dimensao]}</li>
              ))}
            </ul>
          ) : (
            <p>Não há dimensões destacadas.</p>
          )}
        </div>

        <div>
          <h2>Áreas de melhoria</h2>
          {areasDeMelhoria.length > 0 ? (
            <ul>
              {areasDeMelhoria.map((dimensao) => (
                <li key={dimensao}>{NOME_DIMENSAO[dimensao]}</li>
              ))}
            </ul>
          ) : (
            <p>Não há áreas identificadas.</p>
          )}
        </div>
      </section>

      <section className="resultado-chamada">
        {erroPlano && (
          <p className="mensagem mensagem-erro" role="alert">
            {erroPlano}
          </p>
        )}

        <button
          type="button"
          className="botao-principal"
          onClick={onGerarPlano}
          disabled={gerandoPlano}
        >
          {gerandoPlano ? 'Gerando seu plano...' : 'Gerar meu Plano de Ação'}
        </button>

        {dimensoesAbaixoDoLimite === 0 && (
          <p className="resultado-chamada-nota">
            Todas as dimensões estão acima de {LIMITE_PLANO} pontos.
          </p>
        )}
      </section>

      <footer className="diagnostico-acoes">
        <button type="button" onClick={onVoltar}>
          Voltar à área da empresa
        </button>

        <button type="button" onClick={onNovoDiagnostico}>
          Fazer novo diagnóstico
        </button>
      </footer>
    </div>
  )
}

export default ResultadoDiagnostico