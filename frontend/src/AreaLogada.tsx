
import { useCallback, useEffect, useState } from 'react'
import { apiFetch, ApiError, mensagemDeErro } from './api'
import { nivelPorPontuacao } from './dimensoes'
import type { Resultado, Usuario } from './types'
import Diagnostico from './components/Diagnostico'
import Layout, { type Tela } from './components/layout'
import MeuPlano from './components/MeuPlano'
import ResultadoDiagnostico from './components/ResultadoDiagnostico'
import TarjetaEmpresa from './components/TarjetaEmpresa'
import AcademiaODS from './components/AcademiaODS'
import RadarOportunidades from './RadarOportunidades'
import IconeMenu from './components/IconeMenu'
import './MiEmpresa.css'

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

    if (tela === 'academia') {
      return <AcademiaODS />
    }

    if (tela === 'radar') {
      return <RadarOportunidades />
    }

    return (
      <div className="inicio-grid">
        <TarjetaEmpresa usuario={usuario} />

        <section className="cartao-logado">
          <header className="inicio-card-cabecalho">
            <span className="inicio-card-icone">
              <IconeMenu nome="diagnostico" tamanho={25} />
            </span>

            <div>
              <h2>Diagnóstico</h2>
              <p>Conoce el estado de tu empresa</p>
            </div>
          </header>

          {erro && (
            <p className="mensagem mensagem-erro" role="alert">
              {erro}
            </p>
          )}

          {carregando ? (
            <p>Verificando tu diagnóstico...</p>
          ) : ultimoResultado ? (
            <section className="ultimo-diagnostico">
              <h3>Tu último diagnóstico</h3>

              <div className="inicio-diagnostico-pontuacao">
                <span>Puntaje obtenido</span>

                <div className="inicio-pontuacao-valor">
                  <strong>{ultimoResultado.pontuacao}</strong>
                  <span>/100</span>
                </div>

                <div className="inicio-diagnostico-nivel">
                  <span>Nivel:</span>

                  <strong>
                    {nivelPorPontuacao(ultimoResultado.pontuacao)}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="inicio-botao-secundario"
                onClick={() => irPara('resultado')}
              >
                Ver resultado completo
                <span aria-hidden="true">→</span>
              </button>
            </section>
          ) : (
            <section className="ultimo-diagnostico">
              <div className="inicio-sem-diagnostico">
                <IconeMenu
                  nome="diagnostico"
                  tamanho={48}
                />

                <h3>Comienza tu diagnóstico</h3>

                <p>
                  Responde las preguntas para conocer
                  el nivel de sostenibilidad de tu empresa.
                </p>
              </div>
            </section>
          )}

          <button
            type="button"
            className="botao-principal"
            onClick={iniciarDiagnostico}
            disabled={carregando}
          >
            <IconeMenu nome="diagnostico" tamanho={19} />
            Iniciar nuevo diagnóstico
          </button>
        </section>
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
