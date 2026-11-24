
import { useEffect, useState } from 'react'
import { apiFetch, mensagemDeErro } from '../api'
import '../diagnostico.css'
import '../Questionario.css'
import {
  DIMENSOES_ATIVAS,
  NOME_DIMENSAO,
  ehDimensaoAtiva,
} from '../dimensoes'
import type { Pergunta, Resultado } from '../types'
import IconeMenu from './IconeMenu'

type DadosPerguntas = {
  perguntas: Pergunta[]
}

type Props = {
  onConcluir: (resultado: Resultado) => void
  onCancelar: () => void
}

const OPCOES_RESPOSTA = [
  { valor: 10, rotulo: 'Sí, completamente' },
  { valor: 5, rotulo: 'Parcialmente / En proceso' },
  { valor: 0, rotulo: 'No' },
]

const DESCRICOES_DIMENSOES = [
  'Impacto ambiental y uso de recursos',
  'Personas y responsabilidad social',
  'Gestión y sostenibilidad económica',
]

function Diagnostico({ onConcluir, onCancelar }: Props) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [etapa, setEtapa] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarPerguntas() {
      try {
        const dados = await apiFetch<DadosPerguntas>('/perguntas')

        setPerguntas(
          dados.perguntas.filter((pergunta) =>
            ehDimensaoAtiva(pergunta.dimensao),
          ),
        )
      } catch (error) {
        setErro(mensagemDeErro(error))
      } finally {
        setCarregando(false)
      }
    }

    carregarPerguntas()
  }, [])

  const dimensaoAtual = DIMENSOES_ATIVAS[etapa]

  const perguntasDaEtapa = perguntas
    .filter((pergunta) => pergunta.dimensao === dimensaoAtual)
    .sort((a, b) => a.ordem - b.ordem)

  const respondidas = Object.keys(respostas).length
  const totalPerguntas = perguntas.length

  const progresso =
    totalPerguntas === 0
      ? 0
      : Math.round((respondidas / totalPerguntas) * 100)

  const respondidasNaEtapa = perguntasDaEtapa.filter(
    (pergunta) => respostas[pergunta.id] !== undefined,
  ).length

  const etapaCompleta =
    perguntasDaEtapa.length > 0 &&
    perguntasDaEtapa.every(
      (pergunta) => respostas[pergunta.id] !== undefined,
    )

  function selecionarResposta(perguntaId: string, valor: number) {
    setRespostas((anteriores) => ({
      ...anteriores,
      [perguntaId]: valor,
    }))
    setErro('')
  }

  function avancar() {
    if (!etapaCompleta) {
      setErro('Responde todas las preguntas de esta etapa para continuar.')
      return
    }

    setErro('')
    setEtapa((atual) =>
      Math.min(atual + 1, DIMENSOES_ATIVAS.length - 1),
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function voltar() {
    setErro('')
    setEtapa((atual) => Math.max(atual - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enviarDiagnostico() {
    if (!etapaCompleta) {
      setErro('Responde todas las preguntas de esta etapa para continuar.')
      return
    }

    if (respondidas !== totalPerguntas) {
      setErro('Verifica que todas las preguntas estén respondidas.')
      return
    }

    setEnviando(true)
    setErro('')

    try {
      const dados = await apiFetch<Resultado>('/diagnosticos', {
        method: 'POST',
        body: JSON.stringify({
          respostas: perguntas.map((pergunta) => ({
            perguntaId: pergunta.id,
            valor: respostas[pergunta.id],
          })),
        }),
      })

      onConcluir(dados)
    } catch (error) {
      setErro(mensagemDeErro(error))
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <div className="questionario-estado" role="status">
        <IconeMenu nome="diagnostico" tamanho={36} />
        <h2>Cargando diagnóstico...</h2>
        <p>Estamos preparando tus preguntas.</p>
      </div>
    )
  }

  if (perguntas.length === 0) {
    return (
      <div className="questionario-estado">
        <h2>No fue posible cargar el diagnóstico</h2>

        <p role="alert">
          {erro || 'No se encontró ninguna pregunta.'}
        </p>

        <button
          type="button"
          className="questionario-botao-secundario"
          onClick={onCancelar}
        >
          Volver al área de la empresa
        </button>
      </div>
    )
  }

  return (
    <div className="questionario">

      <header className="questionario-cabecalho">
        <div className="questionario-cabecalho-texto">
          <span className="questionario-icone">
            <IconeMenu nome="diagnostico" tamanho={28} />
          </span>

          <div>
            <h1>Diagnóstico de sostenibilidad</h1>

            <p>
              Evalúa las prácticas de tu empresa y descubre
              oportunidades para construir un futuro más sostenible.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="questionario-botao-sair"
          onClick={onCancelar}
          disabled={enviando}
        >
          Salir del diagnóstico
        </button>
      </header>

      <div className="questionario-grid">

        <aside className="questionario-lateral">

          <section className="questionario-painel">
            <h2>Dimensiones</h2>

            <p className="questionario-painel-descricao">
              Completa las tres dimensiones del diagnóstico.
            </p>

            <div className="questionario-dimensoes">
              {DIMENSOES_ATIVAS.map((dimensao, indice) => {
                const perguntasDimensao = perguntas.filter(
                  (pergunta) => pergunta.dimensao === dimensao,
                )

                const quantidadeRespondidas =
                  perguntasDimensao.filter(
                    (pergunta) =>
                      respostas[pergunta.id] !== undefined,
                  ).length

                const completa =
                  perguntasDimensao.length > 0 &&
                  quantidadeRespondidas === perguntasDimensao.length

                const estado =
                  indice === etapa
                    ? 'atual'
                    : completa
                      ? 'concluida'
                      : 'pendente'

                return (
                  <div
                    key={dimensao}
                    className={`questionario-dimensao ${estado}`}
                    aria-current={
                      indice === etapa ? 'step' : undefined
                    }
                  >
                    <span className="questionario-dimensao-numero">
                      {completa && indice !== etapa
                        ? '✓'
                        : indice + 1}
                    </span>

                    <div className="questionario-dimensao-info">
                      <strong>
                        {NOME_DIMENSAO[dimensao]}
                      </strong>

                      <p>{DESCRICOES_DIMENSOES[indice]}</p>

                      <small>
                        {quantidadeRespondidas} de{' '}
                        {perguntasDimensao.length} preguntas
                      </small>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="questionario-painel">
            <div className="questionario-progresso-titulo">
              <h2>Progreso general</h2>
              <strong>{progresso}%</strong>
            </div>

            <progress
              className="questionario-progresso"
              value={progresso}
              max={100}
              aria-label="Progreso general del diagnóstico"
            />

            <p className="questionario-contagem">
              {respondidas} de {totalPerguntas} preguntas respondidas
            </p>
          </section>

          <div className="questionario-dica">
            <IconeMenu nome="progresso" tamanho={24} />

            <div>
              <strong>Recuerda</strong>

              <p>
                Responde según la realidad actual de tu empresa.
                Esto permitirá obtener un diagnóstico más preciso.
              </p>
            </div>
          </div>

        </aside>

        <section className="questionario-principal">

          <header className="questionario-etapa-cabecalho">
            <div>
              <span className="questionario-etiqueta">
                ETAPA {etapa + 1} DE {DIMENSOES_ATIVAS.length}
              </span>

              <h2>
                Dimensión {NOME_DIMENSAO[dimensaoAtual]}
              </h2>

              <p>
                Selecciona la opción que mejor representa
                la situación de tu empresa.
              </p>
            </div>

            <span className="questionario-etapa-contagem">
              {respondidasNaEtapa}/{perguntasDaEtapa.length}
            </span>
          </header>

          <div className="questionario-perguntas">
            {perguntasDaEtapa.map((pergunta, indice) => (
              <article
                className="questionario-pergunta"
                key={pergunta.id}
              >
                <div className="questionario-pergunta-titulo">
                  <span className="questionario-pergunta-numero">
                    {String(indice + 1).padStart(2, '0')}
                  </span>

                  <h3 id={`titulo-${pergunta.id}`}>
                    {pergunta.texto}
                  </h3>
                </div>

                <div
                  className="questionario-opcoes"
                  role="group"
                  aria-labelledby={`titulo-${pergunta.id}`}
                >
                  {OPCOES_RESPOSTA.map((opcao) => (
                    <label
                      key={opcao.valor}
                      className={
                        respostas[pergunta.id] === opcao.valor
                          ? 'questionario-opcao selecionada'
                          : 'questionario-opcao'
                      }
                    >
                      <input
                        type="radio"
                        name={`pergunta-${pergunta.id}`}
                        value={opcao.valor}
                        checked={
                          respostas[pergunta.id] === opcao.valor
                        }
                        disabled={enviando}
                        onChange={() =>
                          selecionarResposta(
                            pergunta.id,
                            opcao.valor,
                          )
                        }
                      />

                      <span>{opcao.rotulo}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {erro && (
            <p className="questionario-erro" role="alert">
              {erro}
            </p>
          )}

          {!etapaCompleta && (
            <p className="questionario-aviso">
              Responde todas las preguntas de esta dimensión
              para continuar.
            </p>
          )}

          <footer className="questionario-acoes">
            <button
              type="button"
              className="questionario-botao-secundario"
              onClick={voltar}
              disabled={etapa === 0 || enviando}
            >
              <span aria-hidden="true">←</span>
              Etapa anterior
            </button>

            {etapa < DIMENSOES_ATIVAS.length - 1 ? (
              <button
                type="button"
                className="questionario-botao-principal"
                onClick={avancar}
                disabled={!etapaCompleta || enviando}
              >
                Siguiente etapa
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="questionario-botao-principal"
                onClick={enviarDiagnostico}
                disabled={!etapaCompleta || enviando}
              >
                {enviando
                  ? 'Enviando...'
                  : 'Finalizar diagnóstico'}

                {!enviando && (
                  <span aria-hidden="true">✓</span>
                )}
              </button>
            )}
          </footer>

        </section>
      </div>
    </div>
  )
}

export default Diagnostico
