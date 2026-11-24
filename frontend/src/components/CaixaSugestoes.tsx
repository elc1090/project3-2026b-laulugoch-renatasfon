import { useState, type FormEvent } from 'react'
import { apiFetch, mensagemDeErro } from '../api'
import './CaixaSugestoes.css'

function CaixaSugestoes() {
  const [aberto, setAberto] = useState(false)
  const [avaliacao, setAvaliacao] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function enviarSugestao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (avaliacao === 0 || enviando) {
      return
    }

    setEnviando(true)
    setErro('')
    setSucesso(false)

    try {
      await apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          avaliacao,
          comentario: comentario.trim(),
        }),
      })

      setSucesso(true)
      setAvaliacao(0)
      setComentario('')
    } catch (error) {
      setErro(mensagemDeErro(error))
    } finally {
      setEnviando(false)
    }
  }

  function alternarFormulario() {
    if (enviando) return

    setAberto(!aberto)
    setErro('')
  }

  return (
    <div className="caixa-sugestoes">
      <button
        type="button"
        className="caixa-sugestoes-botao"
        onClick={alternarFormulario}
        aria-expanded={aberto}
        aria-label={aberto ? 'Cerrar sugerencias' : 'Abrir buzón de sugerencias'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.5-4A8.5 8.5 0 1 1 21 11.5Z" /><path d="M8 10h9M8 14h6" /></>}
        </svg>
      </button>

      {aberto && (
        <section className="caixa-sugestoes-painel">
          <header className="caixa-sugestoes-cabecalho">
            <span>AYÚDANOS A MEJORAR</span>
            <h2>Buzón de Sugerencias</h2>
            <p>Tu opinión nos ayuda a mejorar EcoSME.</p>
          </header>

          {sucesso ? (
            <div role="status" className="caixa-sugestoes-sucesso">
              <span aria-hidden="true">✓</span>
              <p>¡Gracias por compartir tu opinión!</p>
              <button
                type="button"
                className="botao-principal"
                onClick={() => setSucesso(false)}
              >
                Enviar otra opinión
              </button>
            </div>
          ) : (
            <form onSubmit={enviarSugestao}>
              <fieldset className="caixa-sugestoes-estrelas">
                <legend>¿Cómo calificarías tu experiencia?</legend>

                <div className="caixa-sugestoes-avaliacao">
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <button
                      key={estrela}
                      type="button"
                      className={estrela <= avaliacao ? 'selecionada' : ''}
                      onClick={() => setAvaliacao(estrela)}
                      aria-label={`${estrela} estrellas`}
                      aria-pressed={avaliacao === estrela}
                      disabled={enviando}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>

              <label htmlFor="comentario-sugestao">
                Comentarios o sugerencias (opcional)
              </label>

              <textarea
                id="comentario-sugestao"
                value={comentario}
                onChange={(evento) => setComentario(evento.target.value)}
                placeholder="Cuéntanos qué podemos mejorar..."
                rows={4}
                maxLength={1000}
                disabled={enviando}
              />

              <small className="caixa-sugestoes-contador">{comentario.length}/1000</small>

              {erro && (
                <p className="mensagem mensagem-erro" role="alert">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                className="botao-principal"
                disabled={avaliacao === 0 || enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar opinión'}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  )
}

export default CaixaSugestoes