
import { NOME_DIMENSAO, ENFOQUE_NIVEL } from '../dimensoes'
import type { Resultado } from '../types'
import '../diagnostico.css'

type Props = {
  resultado: Resultado
  onNovoDiagnostico: () => void
  onVoltar: () => void
}

function ResultadoDiagnostico({
  resultado,
  onNovoDiagnostico,
  onVoltar,
}: Props) {
  return (
    <main className="diagnostico-container">
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
        <h2>{resultado.nivel}</h2>
        <p>
          {ENFOQUE_NIVEL[resultado.nivel] ??
            'Consulte os resultados por dimensão para identificar oportunidades de melhoria.'}
        </p>
      </section>

      <section className="resultado-dimensoes">
        <h2>Pontuação por dimensão</h2>

        {resultado.dimensoes.map((item) => (
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
          {resultado.fortalezas.length > 0 ? (
            <ul>
              {resultado.fortalezas.map((dimensao) => (
                <li key={dimensao}>{NOME_DIMENSAO[dimensao]}</li>
              ))}
            </ul>
          ) : (
            <p>Não há dimensões destacadas.</p>
          )}
        </div>

        <div>
          <h2>Áreas de melhoria</h2>
          {resultado.areasDeMelhoria.length > 0 ? (
            <ul>
              {resultado.areasDeMelhoria.map((dimensao) => (
                <li key={dimensao}>{NOME_DIMENSAO[dimensao]}</li>
              ))}
            </ul>
          ) : (
            <p>Não há áreas identificadas.</p>
          )}
        </div>
      </section>

      <footer className="diagnostico-acoes">
        <button type="button" onClick={onVoltar}>
          Voltar à área da empresa
        </button>

        <button type="button" onClick={onNovoDiagnostico}>
          Fazer novo diagnóstico
        </button>
      </footer>
    </main>
  )
}

export default ResultadoDiagnostico