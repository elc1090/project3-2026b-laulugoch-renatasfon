import { useEffect, useState } from 'react'
import { apiFetch, ApiError, mensagemDeErro } from '../api'
import { LIMITE_PLANO, NOME_DIMENSAO, ehDimensaoAtiva } from '../dimensoes'
import type { ItemPlano, Plano } from '../types'

type Props = {
  onSair: () => void
  onIrParaDiagnostico: () => void
}

function MeuPlano({ onSair, onIrParaDiagnostico }: Props) {
  const [itens, setItens] = useState<ItemPlano[]>([])
  const [carregando, setCarregando] = useState(true)
  const [semDiagnostico, setSemDiagnostico] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const plano = await apiFetch<Plano>('/plano')

        if (ativo) {
          setItens(plano.dimensoes.filter((i) => ehDimensaoAtiva(i.dimensao)))
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

  const acoes = itens.filter((i) => i.situacao === 'ACAO')
  const reforcos = itens.filter((i) => i.situacao === 'REFORCO')

  return (
    <div className="diagnostico-container">
      <header className="resultado-cabecalho">
        <p>EcoSME</p>
        <h1>Mi Plan de Acción</h1>
        <p>
          Acciones sugeridas para las dimensiones con menos de {LIMITE_PLANO} puntos.
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
            <p>Realiza el diagnóstico antes de ver tu plan de acción.</p>
            <button type="button" onClick={onIrParaDiagnostico}>
              Hacer diagnóstico
            </button>
          </div>
        )}

        {acoes.map((item) => (
          <article className="plano-tarefa" key={item.dimensao}>
            <div className="plano-tarefa-topo">
              <span className="plano-tarefa-dimensao">
                {NOME_DIMENSAO[item.dimensao]}
              </span>
              <span className="plano-tarefa-pontos">{item.pontuacao}/100</span>
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
          <article className="plano-tarefa plano-reforco" key={item.dimensao}>
            <div className="plano-tarefa-topo">
              <span className="plano-tarefa-dimensao">
                {NOME_DIMENSAO[item.dimensao]}
              </span>
              <span className="plano-tarefa-pontos">{item.pontuacao}/100</span>
            </div>

            <h2>{item.reforco?.titulo}</h2>
            <p>{item.reforco?.descricao}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default MeuPlano