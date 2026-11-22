
import { useEffect, useState } from 'react'
import { apiFetch, ApiError, mensagemDeErro } from '../api'
import { LIMITE_PLANO, NOME_DIMENSAO, ehDimensaoAtiva } from '../dimensoes'
import type {
  ItemPlano,
  Plano,
  RespostaPlanoIA,
  RecomendacaoIA,
} from '../types'

type Props = {
  onSair: () => void
  onIrParaDiagnostico: () => void
}

type PlanoSalvo = {
  diagnosticoId: number
  planoId: number
  plano: {
    recomendacoes: RecomendacaoIA[]
  }
  createdAt: string
  updatedAt: string
}

type PlanoHistorico = {
  id: number
  diagnosticoId: number
  recomendacoes: RecomendacaoIA[]
  createdAt: string
  updatedAt: string
  diagnostico: {
    createdAt: string
    pontuacao: number
  }
}

type RespostaHistorico = {
  planos: PlanoHistorico[]
}

function MeuPlano({ onSair, onIrParaDiagnostico }: Props) {
  const [itens, setItens] = useState<ItemPlano[]>([])
  const [carregando, setCarregando] = useState(true)
  const [semDiagnostico, setSemDiagnostico] = useState(false)
  const [erro, setErro] = useState('')

  const [diagnosticoAtualId, setDiagnosticoAtualId] = useState<number | null>(null)

  const [recomendacoes, setRecomendacoes] = useState<RecomendacaoIA[]>([])
  const [gerandoIA, setGerandoIA] = useState(false)
  const [erroIA, setErroIA] = useState('')
  const [mostrarIA, setMostrarIA] = useState(false)

  const [historico, setHistorico] = useState<PlanoHistorico[]>([])
  const [planoHistorico, setPlanoHistorico] = useState<PlanoHistorico | null>(null)
  const [mostrarHistorico, setMostrarHistorico] = useState(false)
  const [erroHistorico, setErroHistorico] = useState('')

  // Busca o histórico de planos da empresa
  async function carregarHistorico() {
    try {
      const resposta = await apiFetch<RespostaHistorico>(
        '/plano/ia/historico'
      )

      setHistorico(resposta.planos)
      setErroHistorico('')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onSair()
      } else {
        setErroHistorico(mensagemDeErro(error))
      }
    }
  }

  // Carrega o plano tradicional e o plano salvo com IA
  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const plano = await apiFetch<Plano>('/plano')

        if (!ativo) return

        setItens(
          plano.dimensoes.filter((item) =>
            ehDimensaoAtiva(item.dimensao)
          )
        )

        setDiagnosticoAtualId(plano.diagnosticoId)

        // Verifica se já existe um plano de IA salvo
        try {
          const salvo = await apiFetch<PlanoSalvo>('/plano/ia')

          if (ativo) {
            setRecomendacoes(salvo.plano.recomendacoes)
            setMostrarIA(true)
          }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            onSair()
            return
          }

          // 404 significa que ainda não existe plano de IA
          if (!(error instanceof ApiError && error.status === 404)) {
            if (ativo) setErroIA(mensagemDeErro(error))
          }
        }

        const resposta = await apiFetch<RespostaHistorico>(
          '/plano/ia/historico'
        )

        if (ativo) {
          setHistorico(resposta.planos)
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          onSair()
        } else if (error instanceof ApiError && error.status === 404) {
          if (ativo) setSemDiagnostico(true)
        } else if (ativo) {
          setErro(mensagemDeErro(error))
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [onSair])

  // Gera e salva um novo plano com Gemini
  async function gerarComIA() {
    if (gerandoIA) return

    setGerandoIA(true)
    setErroIA('')

    try {
      const resposta = await apiFetch<RespostaPlanoIA>(
        '/plano/ia',
        { method: 'POST' }
      )

      setRecomendacoes(resposta.plano.recomendacoes)
      setPlanoHistorico(null)
      setMostrarIA(true)
      setMostrarHistorico(false)

      await carregarHistorico()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onSair()
      } else {
        setErroIA(mensagemDeErro(error))
      }
    } finally {
      setGerandoIA(false)
    }
  }

  // Visualiza um plano anterior
  function visualizarHistorico(plano: PlanoHistorico) {
    setPlanoHistorico(plano)
    setMostrarIA(true)
    setMostrarHistorico(false)
  }

  // Volta para o plano tradicional
  function voltarOriginal() {
    setMostrarIA(false)
    setPlanoHistorico(null)
  }

  // Mostra o plano de IA do diagnóstico atual
  function verPlanoAtualIA() {
    setPlanoHistorico(null)
    setMostrarIA(true)
  }

  const acoes = itens.filter((item) => item.situacao === 'ACAO')
  const reforcos = itens.filter((item) => item.situacao === 'REFORCO')

  const recomendacoesExibidas = planoHistorico
    ? planoHistorico.recomendacoes
    : recomendacoes

  const planosAnteriores = historico.filter(
    (plano) => plano.diagnosticoId !== diagnosticoAtualId
  )

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('es-CL')
  }

  return (
    <div className="diagnostico-container">
      <header className="resultado-cabecalho">
        <p>EcoSME</p>
        <h1>Mi Plan de Acción</h1>
        <p>
          {mostrarIA
            ? 'Recomendaciones personalizadas para mejorar la sostenibilidad de tu empresa.'
            : `Acciones sugeridas para las dimensiones con menos de ${LIMITE_PLANO} puntos.`}
        </p>
      </header>

      <section className="plano-lista">

        {carregando && <p>Cargando tu plan...</p>}

        {erro && (
          <p className="mensagem mensagem-erro" role="alert">
            {erro}
          </p>
        )}

        {semDiagnostico && (
          <div className="plano-vazio">
            <p>
              Realiza el diagnóstico antes de ver tu plan de acción.
            </p>
            <button
              type="button"
              onClick={onIrParaDiagnostico}
            >
              Hacer diagnóstico
            </button>
          </div>
        )}

        {!carregando && !semDiagnostico && !erro && (
          <>
            {/* BOTÕES DE CONTROLE */}
            <div className="plano-ia-controles">

              {!mostrarIA && recomendacoes.length === 0 && (
                 <button
                    type="button"
                    className="botao-principal"
                    onClick={gerarComIA}
                    disabled={gerandoIA}
                  >
                  {gerandoIA
                    ? 'Generando recomendaciones...'
                      : 'Generar mi plan con IA'}
                </button>
              )}

              {mostrarIA && (
                <button
                  type="button"
                  className="botao-principal"
                  onClick={voltarOriginal}
                  disabled={gerandoIA}
                >
                  Volver al plan original
                </button>
              )}

              {!mostrarIA && recomendacoes.length > 0 && (
                <button
                  type="button"
                  className="botao-principal"
                  onClick={verPlanoAtualIA}
                  disabled={gerandoIA}
                >
                  Ver mi plan con IA
                </button>
              )}

              {planosAnteriores.length > 0 && (
                <button
                  type="button"
                  className="botao-principal"
                  onClick={() => setMostrarHistorico(!mostrarHistorico)}
                  disabled={gerandoIA}
                >
                  {mostrarHistorico
                    ? 'Ocultar historial'
                    : 'Historial de planes'}
                </button>
              )}

              {gerandoIA && (
                <p role="status">
                  La IA está analizando tu diagnóstico.
                  Esto puede tardar unos segundos.
                </p>
              )}

              {erroIA && (
                <p className="mensagem mensagem-erro" role="alert">
                  {erroIA}
                </p>
              )}

              {erroHistorico && (
                <p className="mensagem mensagem-erro" role="alert">
                  {erroHistorico}
                </p>
              )}
            </div>

            {/* HISTÓRICO */}
            {mostrarHistorico && (
              <section className="plano-ia-historico">
                <h2>Historial de planes con IA</h2>

                {planosAnteriores.map((plano) => (
                  <article
                    className="plano-tarefa"
                    key={plano.id}
                  >
                    <h3>
                      Diagnóstico del{' '}
                      {formatarData(plano.diagnostico.createdAt)}
                    </h3>

                    <p>
                      <strong>Puntuación:</strong>{' '}
                      {plano.diagnostico.pontuacao}/100
                    </p>

                    <p>
                      <strong>Plan generado:</strong>{' '}
                      {formatarData(plano.createdAt)}
                    </p>

                    <button
                      type="button"
                      className="botao-principal"
                      onClick={() => visualizarHistorico(plano)}
                    >
                      Ver recomendaciones
                    </button>
                  </article>
                ))}
              </section>
            )}

            {/* CARREGAMENTO DA IA */}
            {gerandoIA && (
              <div className="plano-vazio">
                <p>Generando tu plan personalizado con IA...</p>
              </div>
            )}

            {/* RECOMENDAÇÕES COM IA */}
            {!gerandoIA && mostrarIA && recomendacoesExibidas.length > 0 && (
              <section
                className="plano-ia-resultados"
                aria-label="Recomendaciones de inteligencia artificial"
              >
                <h2>
                  {planoHistorico
                    ? `Plan del ${formatarData(planoHistorico.diagnostico.createdAt)}`
                    : 'Recomendaciones personalizadas con IA'}
                </h2>

                <p>
                  Propuestas generadas a partir del diagnóstico.
                  Revisa su viabilidad antes de aplicarlas.
                </p>

                {recomendacoesExibidas.map((item, indice) => (
                  <article
                    className="plano-tarefa plano-ia-cartao"
                    key={`${indice}-${item.titulo}`}
                  >
                    <div className="plano-tarefa-topo">
                      <span className="plano-tarefa-dimensao">
                        {NOME_DIMENSAO[item.dimensao]}
                      </span>

                      <span className="plano-ia-prioridade">
                        Prioridad: {item.prioridade}
                      </span>
                    </div>

                    <h3>{item.titulo}</h3>
                    <p>{item.justificativa}</p>

                    <p>
                      <strong>Plazo estimado:</strong> {item.prazo}
                    </p>

                    <h4>Pasos prácticos</h4>

                    <ol>
                      {item.passos.map((paso, i) => (
                        <li key={i}>{paso}</li>
                      ))}
                    </ol>

                    <p>
                      <strong>Indicador:</strong> {item.indicador}
                    </p>

                    <p>
                      <strong>ODS:</strong>{' '}
                      {item.ods.join(', ') || 'No especificado'}
                    </p>
                  </article>
                ))}
              </section>
            )}

            {/* PLANO ORIGINAL */}
            {!gerandoIA && !mostrarIA && (
              <>
                {acoes.map((item) => (
                  <article
                    className="plano-tarefa"
                    key={item.dimensao}
                  >
                    <div className="plano-tarefa-topo">
                      <span className="plano-tarefa-dimensao">
                        {NOME_DIMENSAO[item.dimensao]}
                      </span>

                      <span className="plano-tarefa-pontos">
                        {item.pontuacao}/100
                      </span>
                    </div>

                    <h2>{item.acao?.titulo}</h2>
                    <p>{item.acao?.descricao}</p>

                    <dl className="plano-detalhes">
                      <div>
                        <dt>Indicador</dt>
                        <dd>{item.acao?.indicador}</dd>
                      </div>

                      {item.acao && item.acao.ods.length > 0 && (
                        <div>
                          <dt>ODS</dt>
                          <dd>{item.acao.ods.join(', ')}</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                ))}

                {reforcos.map((item) => (
                  <article
                    className="plano-tarefa plano-reforco"
                    key={item.dimensao}
                  >
                    <div className="plano-tarefa-topo">
                      <span className="plano-tarefa-dimensao">
                        {NOME_DIMENSAO[item.dimensao]}
                      </span>

                      <span className="plano-tarefa-pontos">
                        {item.pontuacao}/100
                      </span>
                    </div>

                    <h2>{item.reforco?.titulo}</h2>
                    <p>{item.reforco?.descricao}</p>
                  </article>
                ))}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default MeuPlano
