import { useEffect, useState } from 'react'
import { apiFetch, ApiError, mensagemDeErro } from '../api'
import { NOME_DIMENSAO, ehDimensaoAtiva } from '../dimensoes'
import type { Tarefa } from '../types'

type Props = {
  onSair: () => void
  onIrParaDiagnostico: () => void
}

function MeuPlano({ onSair, onIrParaDiagnostico }: Props) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        // PROVISÓRIO: trocar pela rota real de listagem das tarefas
        const dados = await apiFetch<{ tarefas: Tarefa[] }>('/plano')

        if (ativo) {
          setTarefas(dados.tarefas.filter((t) => ehDimensaoAtiva(t.dimensao)))
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          onSair()
        } else if (ativo) {
          setErro(mensagemDeErro(error))
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [onSair])

  return (
    <div className="diagnostico-container">
      <header className="resultado-cabecalho">
        <p>EcoSME</p>
        <h1>Meu Plano de Ação</h1>
        <p>Tarefas geradas a partir do seu diagnóstico.</p>
      </header>

      <section className="plano-lista">
        {carregando && <p>Carregando seu plano...</p>}

        {erro && (
          <p className="mensagem mensagem-erro" role="alert">
            {erro}
          </p>
        )}

        {!carregando && !erro && tarefas.length === 0 && (
          <div className="plano-vazio">
            <p>
              Seu plano ainda não tem tarefas. Elas são criadas quando uma
              dimensão fica abaixo de 60 pontos.
            </p>
            <button type="button" onClick={onIrParaDiagnostico}>
              Fazer um diagnóstico
            </button>
          </div>
        )}

        {tarefas.map((tarefa) => (
          <article className="plano-tarefa" key={tarefa.id}>
            <span className="plano-tarefa-dimensao">
              {NOME_DIMENSAO[tarefa.dimensao]}
            </span>
            <h2>{tarefa.titulo}</h2>
            {tarefa.descricao && <p>{tarefa.descricao}</p>}
          </article>
        ))}
      </section>
    </div>
  )
}

export default MeuPlano