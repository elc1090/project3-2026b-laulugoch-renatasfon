
import { useEffect, useState } from 'react'
import { apiFetch, ApiError, mensagemDeErro } from './api'
import type { Resultado, Usuario } from './types'
import Diagnostico from './components/Diagnostico'
import ResultadoDiagnostico from './components/ResultadoDiagnostico'

type Props = {
  usuario: Usuario
  onSair: () => void
}

function AreaLogada({ usuario, onSair }: Props) {
  const [tela, setTela] = useState<'inicio' | 'diagnostico' | 'resultado'>(
    'inicio',
  )
  const [ultimoResultado, setUltimoResultado] = useState<Resultado | null>(
    null,
  )
  const [resultadoAtual, setResultadoAtual] = useState<Resultado | null>(
    null,
  )
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregarUltimoDiagnostico() {
      try {
        const resultado = await apiFetch<Resultado>('/diagnosticos/ultimo')

        if (ativo) {
          setUltimoResultado(resultado)
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          if (ativo) {
            setUltimoResultado(null)
          }
        } else if (error instanceof ApiError && error.status === 401) {
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

    carregarUltimoDiagnostico()

    return () => {
      ativo = false
    }
  }, [onSair])

  function concluirDiagnostico(resultado: Resultado) {
    setResultadoAtual(resultado)
    setUltimoResultado(resultado)
    setTela('resultado')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function iniciarDiagnostico() {
    setErro('')
    setResultadoAtual(null)
    setTela('diagnostico')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (tela === 'diagnostico') {
    return (
      <Diagnostico
        onConcluir={concluirDiagnostico}
        onCancelar={() => setTela('inicio')}
      />
    )
  }

  if (tela === 'resultado' && resultadoAtual) {
    return (
      <ResultadoDiagnostico
        resultado={resultadoAtual}
        onNovoDiagnostico={iniciarDiagnostico}
        onVoltar={() => setTela('inicio')}
      />
    )
  }

  return (
    <main className="area-logada">
      <div className="cartao-logado">
        <span className="etiqueta">Área da empresa</span>

        <h1>Bem-vinda, {usuario.nomeEmpresa}!</h1>

        <p>Você está autenticada no sistema.</p>

        <p>
          <strong>E-mail:</strong> {usuario.email}
        </p>

        {erro && (
          <p className="mensagem mensagem-erro" role="alert">
            {erro}
          </p>
        )}

        {carregando ? (
          <p>Verificando seu diagnóstico...</p>
        ) : ultimoResultado ? (
          <section className="ultimo-diagnostico">
            <h2>Seu último diagnóstico</h2>
            <p>
              Pontuação: <strong>{ultimoResultado.pontuacao}/100</strong>
            </p>
            <p>
              Nível: <strong>{ultimoResultado.nivel}</strong>
            </p>

            <button
              type="button"
              className="botao-principal"
              onClick={() => {
                setResultadoAtual(ultimoResultado)
                setTela('resultado')
              }}
            >
              Ver resultado completo
            </button>
          </section>
        ) : (
          <section className="ultimo-diagnostico">
            <h2>Comece seu diagnóstico</h2>
            <p>
              Responda às perguntas para conhecer o nível de sustentabilidade
              da sua empresa.
            </p>
          </section>
        )}

        <button
          type="button"
          className="botao-principal"
          onClick={iniciarDiagnostico}
          disabled={carregando}
        >
          Iniciar novo diagnóstico
        </button>

        <button type="button" onClick={onSair}>
          Sair da conta
        </button>
      </div>
    </main>
  )
}

export default AreaLogada