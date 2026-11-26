import { useState } from 'react'
import { apiFetch, mensagemDeErro } from '../api'
import './AcademiaODS.css'
import IconeMenu from './IconeMenu'

type PerguntaQuiz = {
  enunciado: string
  alternativas: string[]
  correta: number
  explicacao: string
}

const PERGUNTAS: PerguntaQuiz[] = [
  {
    enunciado:
      '¿Qué acción genera mayor impacto en la Dimensión Social de tu empresa?',
    alternativas: [
      'Donar a una ONG internacional una vez al año.',
      'Implementar condiciones seguras de trabajo y comprar insumos a productores locales.',
      'Imprimir reportes en papel reciclado.',
    ],
    correta: 1,
    explicacao:
      'La sostenibilidad social comienza por garantizar el bienestar de los trabajadores y fortalecer la economía de la comunidad local.',
  },
  {
    enunciado:
      'Si implementas un sistema de bajo consumo eléctrico en tu local, ¿qué dimensiones estás abordando?',
    alternativas: [
      'Solo la Ambiental.',
      'La Ambiental y la Financiera.',
      'La Social y Ambiental.',
    ],
    correta: 1,
    explicacao:
      'Al reducir el consumo energético, disminuyes tu huella de carbono (Ambiental) y bajas tus costos fijos operativos (Financiera).',
  },
  {
    enunciado:
      'En una PyME, ¿qué significa aplicar la Economía Circular?',
    alternativas: [
      'Vender en envases redondos.',
      'Diseñar procesos donde los residuos se conviertan en insumos para otra etapa, eliminando la "basura".',
      'Cambiar el logo a verde.',
    ],
    correta: 1,
    explicacao:
      'La economía circular busca extender el ciclo de vida de los materiales, transformando los desechos en recursos.',
  },
  {
    enunciado:
      '¿Por qué controlar las mermas de materia prima es clave para una PyME?',
    alternativas: [
      'Porque reduce el impacto ambiental y aumenta directamente el margen de ganancia del negocio.',
      'Solo sirve para cumplir con trámites municipales.',
      'No tiene impacto real en las finanzas de la empresa.',
    ],
    correta: 0,
    explicacao:
      'Reducir el desperdicio (ODS 12) evita tirar dinero a la basura, protegiendo tanto el planeta como la rentabilidad de la PyME.',
  },
  {
    enunciado:
      '¿Cómo ayuda la digitalización de inventarios (como planillas automatizadas o un ERP) a la sostenibilidad?',
    alternativas: [
      'Solo sirve para grandes empresas con cientos de trabajadores.',
      'Aumenta los costos fijos sin generar beneficios operativos.',
      'Permite controlar costos, evitar compras en exceso y mejorar la eficiencia productiva.',
    ],
    correta: 2,
    explicacao:
      'La innovación y el uso de tecnología (ODS 9) permiten tomar mejores decisiones financieras y evitar pérdidas innecesarias.',
  },
]

function AcademiaODS() {
  const [indicePergunta, setIndicePergunta] = useState(0)
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [concluido, setConcluido] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)

  const pergunta = PERGUNTAS[indicePergunta]
  const respondeu = respostaSelecionada !== null
  const acertou = respostaSelecionada === pergunta.correta

  function responder(indice: number) {
    if (respondeu || salvando) return

    setRespostaSelecionada(indice)

    if (indice === pergunta.correta) {
      setAcertos((atual) => atual + 1)
    }
  }

  async function proximaPergunta() {
    if (respostaSelecionada === null || salvando) return

    if (indicePergunta < PERGUNTAS.length - 1) {
      setIndicePergunta((atual) => atual + 1)
      setRespostaSelecionada(null)
      return
    }

    setSalvando(true)
    setErro('')

    try {
      await apiFetch('/academia/concluir', {
        method: 'POST',
        body: JSON.stringify({ pontuacao: acertos }),
      })

      setSalvo(true)
      setConcluido(true)
    } catch (error) {
      setErro(mensagemDeErro(error))
    } finally {
      setSalvando(false)
    }
  }

  function reiniciarQuiz() {
    setIndicePergunta(0)
    setRespostaSelecionada(null)
    setAcertos(0)
    setConcluido(false)
    setSalvando(false)
    setErro('')
    setSalvo(false)
  }

  if (concluido) {
    return (
      <section className="academia-container">
        <div className="academia-resultado">
          <span className="academia-insignia" aria-hidden="true">
            <svg width="76" height="76" viewBox="0 0 80 80" fill="none">
              <path d="M24 45L17 72L32 65L40 75L48 65L63 72L56 45" fill="#168443" />
              <circle cx="40" cy="32" r="27" fill="#dcefe0" stroke="#168443" strokeWidth="3" />
              <path d="M28 45C25 25 43 17 55 18C56 37 44 47 28 45Z" fill="#168443" />
              <path d="M25 49L47 27" stroke="#005432" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>

          <h1>¡Felicitaciones!</h1>

          <p>
            Has completado el módulo educativo de Academia ODS.
          </p>

          <div className="academia-pontuacao">
            <span>Tu resultado</span>
            <strong>{acertos}<small>/{PERGUNTAS.length}</small></strong>
            <span>Respuestas correctas</span>
          </div>

          {salvo && (
            <div className="academia-conquista">
              <h3>¡Insignia desbloqueada!</h3>
              <p>
                <strong>Explorador ODS</strong>
              </p>
              <p>
                Tu logro ha sido guardado y estará disponible en Mi Empresa.
              </p>
            </div>
          )}

          <button
            type="button"
            className="botao-principal"
            onClick={reiniciarQuiz}
          >
            Volver a intentar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="academia-container">
      <header className="academia-cabecalho">
        <span className="academia-cabecalho-icone"><IconeMenu nome="academia" tamanho={38} /></span>
        <span className="etiqueta">APRENDIZAJE SOSTENIBLE</span>

        <h1>Academia ODS</h1>

        <p>
          Aprende sobre sostenibilidad empresarial respondiendo preguntas
          rápidas e interactivas.
        </p>
      </header>

      <div className="academia-grid">
        <aside className="academia-lateral">
          <h2>Tu aprendizaje</h2>
          <p>Completa las {PERGUNTAS.length} preguntas del módulo.</p>
          <ol className="academia-etapas">
            {PERGUNTAS.map((_, indice) => (
              <li key={indice} className={indice < indicePergunta || (indice === indicePergunta && respondeu) ? 'concluida' : indice === indicePergunta ? 'atual' : ''}>
                <span>{indice < indicePergunta || (indice === indicePergunta && respondeu) ? '✓' : indice + 1}</span>
                Pregunta {indice + 1}
              </li>
            ))}
          </ol>
          <div className="academia-dica"><strong>Explorador ODS</strong><p>Completa el módulo para desbloquear tu insignia.</p></div>
        </aside>
      <div className="academia-quiz">
        <div className="academia-progresso">
          <span>
            Pregunta {indicePergunta + 1} de {PERGUNTAS.length}
          </span>

          <span>
            {acertos} respuestas correctas
          </span>
        </div>

        <div className="academia-barra">
          <div
            className="academia-barra-preenchimento"
            style={{
              width: `${((indicePergunta + 1) / PERGUNTAS.length) * 100}%`,
            }}
          />
        </div>

        <h2>{pergunta.enunciado}</h2>

        <div className="academia-alternativas">
          {pergunta.alternativas.map((alternativa, indice) => {
            let classe = 'academia-alternativa'

            if (respondeu) {
              if (indice === pergunta.correta) {
                classe += ' correta'
              } else if (indice === respostaSelecionada) {
                classe += ' incorreta'
              }
            }

            return (
              <button
                key={indice}
                type="button"
                className={classe}
                disabled={respondeu}
                onClick={() => responder(indice)}
              >
                <strong>
                  {String.fromCharCode(65 + indice)})
                </strong>

                <span>{alternativa}</span>
              </button>
            )
          })}
        </div>

        {respondeu && (
          <div
            className={`academia-feedback ${acertou ? 'acerto' : 'erro'}`}
            role="status"
          >
            <h3>
              {acertou
                ? '¡Respuesta correcta!'
                : 'Respuesta incorrecta'}
            </h3>

            <p>{pergunta.explicacao}</p>

            {erro && (
              <p className="mensagem mensagem-erro" role="alert">
                {erro}
              </p>
            )}

            <button
              type="button"
              className="botao-principal"
              onClick={proximaPergunta}
              disabled={salvando}
            >
              {salvando
                ? 'Guardando...'
                : indicePergunta === PERGUNTAS.length - 1
                  ? 'Ver mi resultado'
                  : 'Siguiente pregunta'}
            </button>
          </div>
        )}
      </div>
      </div>
    </section>
  )
}

export default AcademiaODS
