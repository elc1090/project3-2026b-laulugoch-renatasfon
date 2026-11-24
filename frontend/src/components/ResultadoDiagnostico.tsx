
import {
  NOME_DIMENSAO,
  ENFOQUE_NIVEL,
  LIMITE_PLANO,
  ehDimensaoAtiva,
  nivelPorPontuacao,
} from '../dimensoes'
import type { Resultado } from '../types'
import IconeMenu from './IconeMenu'
import '../diagnostico.css'
import '../Resultado.css'

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
  const nivel = nivelPorPontuacao(resultado.pontuacao)

  const dimensoes = resultado.dimensoes.filter((item) =>
    ehDimensaoAtiva(item.dimensao),
  )

  const fortalezas = resultado.fortalezas.filter(ehDimensaoAtiva)

  const areasDeMelhoria =
    resultado.areasDeMelhoria.filter(ehDimensaoAtiva)

  const dimensoesAbaixoDoLimite = dimensoes.filter(
    (item) => item.pontuacao < LIMITE_PLANO,
  ).length

  return (
    <div className="avaliacao">

      <header className="avaliacao-cabecalho">
        <span className="avaliacao-icone">
          <IconeMenu nome="resultado" tamanho={28} />
        </span>

        <div>
          <h1>Resultado de la evaluación</h1>

          <p>
            Conoce el nivel de sostenibilidad de tu empresa
            e identifica oportunidades de mejora.
          </p>
        </div>
      </header>

      <div className="avaliacao-grid">

        <section className="avaliacao-resumo">
          <span className="avaliacao-etiqueta">
            TU DIAGNÓSTICO DE SOSTENIBILIDAD
          </span>

          <h2>Puntaje general</h2>

          <div
            className="avaliacao-circulo"
            role="img"
            aria-label={`Puntaje: ${resultado.pontuacao} de 100`}
          >
            <svg
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#ffffff25"
                strokeWidth="12"
              />

              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#a3e5b2"
                strokeWidth="12"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={`${Math.max(
                  0,
                  Math.min(100, resultado.pontuacao),
                )} 100`}
                transform="rotate(-90 80 80)"
              />
            </svg>

            <div className="avaliacao-circulo-texto">
              <strong>{resultado.pontuacao}</strong>
              <span>de 100 puntos</span>
            </div>
          </div>

          <span className="avaliacao-nivel-rotulo">
            Nivel de sostenibilidad
          </span>

          <span className="avaliacao-nivel">
            {nivel}
          </span>

          <p className="avaliacao-enfoque">
            {ENFOQUE_NIVEL[nivel]}
          </p>
        </section>

        <section className="avaliacao-dimensoes">
          <header className="avaliacao-card-cabecalho">
            <span className="avaliacao-icone">
              <IconeMenu nome="progresso" tamanho={24} />
            </span>

            <div>
              <h2>Puntaje por dimensión</h2>
              <p>Desempeño de tu empresa en cada área.</p>
            </div>
          </header>

          <div className="avaliacao-dimensoes-lista">
            {dimensoes.map((item) => (
              <article
                className="avaliacao-dimensao"
                key={item.dimensao}
              >
                <div className="avaliacao-dimensao-cabecalho">
                  <span className="avaliacao-dimensao-icone">
                    {item.dimensao === 'AMBIENTAL' ? (
                      <svg
                        width="23"
                        height="23"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 20C5 8 12 4 21 3C21 14 16 20 5 20Z" />
                        <path d="M3 22L15 10" />
                      </svg>
                    ) : (
                      <IconeMenu
                        nome={
                          item.dimensao === 'SOCIAL'
                            ? 'inicio'
                            : 'progresso'
                        }
                        tamanho={23}
                      />
                    )}
                  </span>

                  <strong>
                    {NOME_DIMENSAO[item.dimensao]}
                  </strong>

                  <span className="avaliacao-dimensao-pontos">
                    {item.pontuacao}
                    <small>/100</small>
                  </span>
                </div>

                <progress
                  className={
                    item.pontuacao >= LIMITE_PLANO
                      ? 'avaliacao-barra positiva'
                      : 'avaliacao-barra melhoria'
                  }
                  value={item.pontuacao}
                  max={100}
                  aria-label={
                    NOME_DIMENSAO[item.dimensao]
                  }
                />

                <span
                  className={
                    item.pontuacao >= LIMITE_PLANO
                      ? 'avaliacao-dimensao-status positiva'
                      : 'avaliacao-dimensao-status melhoria'
                  }
                >
                  {item.pontuacao >= LIMITE_PLANO
                    ? 'Buen desempeño'
                    : 'Oportunidad de mejora'}
                </span>
              </article>
            ))}
          </div>
        </section>

      </div>

      <div className="avaliacao-destaques">

        <section className="avaliacao-destaque fortalezas">
          <header>
            <span className="avaliacao-destaque-icone">
              ✓
            </span>

            <div>
              <h2>Fortalezas</h2>
              <p>Aspectos positivos de tu empresa.</p>
            </div>
          </header>

          {fortalezas.length > 0 ? (
            <ul>
              {fortalezas.map((dimensao) => (
                <li key={dimensao}>
                  <span aria-hidden="true">✓</span>
                  {NOME_DIMENSAO[dimensao]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="avaliacao-sem-itens">
              No hay dimensiones destacadas.
            </p>
          )}
        </section>

        <section className="avaliacao-destaque melhorias">
          <header>
            <span className="avaliacao-destaque-icone">
              <IconeMenu nome="progresso" tamanho={23} />
            </span>

            <div>
              <h2>Áreas de mejora</h2>
              <p>Aspectos que puedes fortalecer.</p>
            </div>
          </header>

          {areasDeMelhoria.length > 0 ? (
            <ul>
              {areasDeMelhoria.map((dimensao) => (
                <li key={dimensao}>
                  <span aria-hidden="true">→</span>
                  {NOME_DIMENSAO[dimensao]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="avaliacao-sem-itens">
              No hay áreas identificadas.
            </p>
          )}
        </section>

      </div>

      <section className="avaliacao-chamada">
        <div className="avaliacao-chamada-conteudo">
          <span className="avaliacao-icone">
            <IconeMenu nome="plano" tamanho={28} />
          </span>

          <div>
            <h2>Transforma tus resultados en acciones</h2>

            <p>
              Consulta tu plan de acción y descubre cómo
              seguir avanzando hacia una empresa más sostenible.
            </p>

            {dimensoesAbaixoDoLimite === 0 && (
              <p className="avaliacao-chamada-nota">
                Todas las dimensiones tienen {LIMITE_PLANO}{' '}
                puntos o más.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="avaliacao-botao-principal"
          onClick={onGerarPlano}
          disabled={gerandoPlano}
        >
          {gerandoPlano
            ? 'Generando tu plan...'
            : 'Generar mi Plan de Acción'}

          {!gerandoPlano && (
            <span aria-hidden="true">→</span>
          )}
        </button>

        {erroPlano && (
          <p className="mensagem mensagem-erro" role="alert">
            {erroPlano}
          </p>
        )}
      </section>

      <footer className="avaliacao-acoes">
        <button
          type="button"
          className="avaliacao-botao-secundario"
          onClick={onVoltar}
        >
          <span aria-hidden="true">←</span>
          Volver al área de la empresa
        </button>

        <button
          type="button"
          className="avaliacao-botao-secundario"
          onClick={onNovoDiagnostico}
        >
          <IconeMenu nome="diagnostico" tamanho={18} />
          Hacer un nuevo diagnóstico
        </button>
      </footer>

    </div>
  )
}

export default ResultadoDiagnostico
