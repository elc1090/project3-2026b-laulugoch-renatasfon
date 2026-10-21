import { useCallback, useEffect, useState } from 'react'
import { apiFetch, ApiError, mensagemDeErro } from './api'
import { nivelPorPontuacao } from './dimensoes'
import type { Resultado, Usuario } from './types'
import Diagnostico from './components/Diagnostico'
import Layout, { type Tela } from './components/layout'
import MeuPlano from './components/MeuPlano'
import ResultadoDiagnostico from './components/ResultadoDiagnostico'
import TarjetaEmpresa from './components/TarjetaEmpresa'

type Props = {
  usuario: Usuario
  onSair: () => void
}

function AreaLogada({ usuario, onSair }: Props) {
  const [tela, setTela] = useState<Tela>('inicio')
  const [ultimoResultado, setUltimoResultado] = useState<Resultado | null>(
    null,
  )
  const [resultadoAtual, setResultadoAtual] = useState<Resultado | null>(null)
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

  function irPara(novaTela: Tela) {
    if (novaTela === 'resultado') {
      setResultadoAtual((atual) => atual ?? ultimoResultado)
    }

    if (novaTela === 'diagnostico') {
      setErro('')
    }

    setTela(novaTela)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function concluirDiagnostico(resultado: Resultado) {
    setResultadoAtual(resultado)
    setUltimoResultado(resultado)
    irPara('resultado')
  }

  function iniciarDiagnostico() {
    setResultadoAtual(null)
    irPara('diagnostico')
  }

  function gerarPlano() {
    irPara('plano')
  }

  const sairDoPlano = useCallback(() => onSair(), [onSair])

  function renderizarConteudo() {
    if (tela === 'diagnostico') {
      return (
        <Diagnostico
          onConcluir={concluirDiagnostico}
          onCancelar={() => irPara('inicio')}
        />
      )
    }

    if (tela === 'resultado' && resultadoAtual) {
      return (
        <ResultadoDiagnostico
          resultado={resultadoAtual}
          gerandoPlano={false}
          erroPlano=""
          onGerarPlano={gerarPlano}
          onNovoDiagnostico={iniciarDiagnostico}
          onVoltar={() => irPara('inicio')}
        />
      )
    }

    if (tela === 'plano') {
      return (
        <MeuPlano
          onSair={sairDoPlano}
          onIrParaDiagnostico={iniciarDiagnostico}
        />
      )
    }

    if (tela === 'acompanhamento') {
      return (
        <div className="diagnostico-container">
          <header className="resultado-cabecalho">
            <p>EcoSME</p>
            <h1>Seguimiento</h1>
            <p>Próximamente podrás seguir aquí la evolución de tu plan.</p>
          </header>
        </div>
      )
    }

    return (
      <div className="inicio-grid">
        <TarjetaEmpresa usuario={usuario} />

        <div className="cartao-logado">
          <span className="etiqueta">Diagnóstico</span>

          {erro && (
            <p className="mensagem mensagem-erro" role="alert">
              {erro}
            </p>
          )}

          {carregando ? (
            <p>Verificando tu diagnóstico...</p>
          ) : ultimoResultado ? (
            <section className="ultimo-diagnostico">
              <h2>Tu último diagnóstico</h2>
              <p>
                Puntaje: <strong>{ultimoResultado.pontuacao}/100</strong>
              </p>
              <p>
                Nivel:{' '}
                <strong>{nivelPorPontuacao(ultimoResultado.pontuacao)}</strong>
              </p>

              <button
                type="button"
                className="botao-principal"
                onClick={() => irPara('resultado')}
              >
                Ver resultado completo
              </button>
            </section>
          ) : (
            <section className="ultimo-diagnostico">
              <h2>Comienza tu diagnóstico</h2>
              <p>
                Responde las preguntas para conocer el nivel de sostenibilidad
                de tu empresa.
              </p>
            </section>
          )}

          <button
            type="button"
            className="botao-principal"
            onClick={iniciarDiagnostico}
            disabled={carregando}
          >
            Iniciar nuevo diagnóstico
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout
      nomeEmpresa={usuario.nomeEmpresa}
      telaAtual={tela}
      temResultado={ultimoResultado !== null}
      onNavegar={irPara}
      onSair={onSair}
    >
      {renderizarConteudo()}
    </Layout>
  )
}

export default AreaLogada