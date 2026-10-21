import { useEffect, useState } from 'react'
import { apiFetch, mensagemDeErro } from '../api'
import '../diagnostico.css'
import { DIMENSOES_ATIVAS, NOME_DIMENSAO, ehDimensaoAtiva } from '../dimensoes'
import type { Pergunta, Resultado } from '../types'

type DadosPerguntas = {
  perguntas: Pergunta[]
}

type Props = {
  onConcluir: (resultado: Resultado) => void
  onCancelar: () => void
}

// Escala padronizada: um único seletor por pergunta
const OPCOES_RESPOSTA = [
  { valor: 10, rotulo: 'Sim, completamente' },
  { valor: 5, rotulo: 'Parcialmente / Em andamento' },
  { valor: 0, rotulo: 'Não' },
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
      setErro('Responda a todas as perguntas desta etapa para continuar.')
      return
    }

    setErro('')
    setEtapa((atual) => Math.min(atual + 1, DIMENSOES_ATIVAS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function voltar() {
    setErro('')
    setEtapa((atual) => Math.max(atual - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enviarDiagnostico() {
    if (!etapaCompleta) {
      setErro('Responda a todas as perguntas desta etapa para continuar.')
      return
    }

    if (respondidas !== totalPerguntas) {
      setErro('Confira se todas as perguntas foram respondidas.')
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
      <div className="diagnostico-container">
        <p>Carregando perguntas...</p>
      </div>
    )
  }

  if (perguntas.length === 0) {
    return (
      <div className="diagnostico-container">
        <h1>Não foi possível carregar o diagnóstico</h1>
        <p>{erro || 'Nenhuma pergunta foi encontrada.'}</p>
        <button type="button" onClick={onCancelar}>
          Voltar à área da empresa
        </button>
      </div>
    )
  }

  return (
    <div className="diagnostico-container">
      <header className="diagnostico-cabecalho">
        <button type="button" onClick={onCancelar}>
          Sair do diagnóstico
        </button>

        <p>Diagnóstico de sustentabilidade</p>
        <h1>{NOME_DIMENSAO[dimensaoAtual]}</h1>
        <p>
          Etapa {etapa + 1} de {DIMENSOES_ATIVAS.length}
        </p>
      </header>

      <section className="diagnostico-progresso">
        <div className="progresso-texto">
          <span>Progresso geral</span>
          <span>
            {respondidas} de {totalPerguntas} perguntas
          </span>
        </div>

        <progress value={progresso} max={100} />
      </section>

      <section className="lista-perguntas">
        {perguntasDaEtapa.map((pergunta, indice) => (
          <article className="pergunta-card" key={pergunta.id}>
            <h2>
              {indice + 1}. {pergunta.texto}
            </h2>

            <div className="opcoes-resposta">
              {OPCOES_RESPOSTA.map((opcao) => (
                <label key={opcao.valor}>
                  <input
                    type="radio"
                    name={`pergunta-${pergunta.id}`}
                    value={opcao.valor}
                    checked={respostas[pergunta.id] === opcao.valor}
                    onChange={() =>
                      selecionarResposta(pergunta.id, opcao.valor)
                    }
                  />
                  <span>{opcao.rotulo}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </section>

      {erro && (
        <p className="diagnostico-erro" role="alert">
          {erro}
        </p>
      )}

      <footer className="diagnostico-acoes">
        <button
          type="button"
          onClick={voltar}
          disabled={etapa === 0 || enviando}
        >
          Etapa anterior
        </button>

        {etapa < DIMENSOES_ATIVAS.length - 1 ? (
          <button type="button" onClick={avancar} disabled={!etapaCompleta}>
            Próxima etapa
          </button>
        ) : (
          <button
            type="button"
            onClick={enviarDiagnostico}
            disabled={!etapaCompleta || enviando}
          >
            {enviando ? 'Enviando...' : 'Concluir diagnóstico'}
          </button>
        )}
      </footer>
    </div>
  )
}

export default Diagnostico