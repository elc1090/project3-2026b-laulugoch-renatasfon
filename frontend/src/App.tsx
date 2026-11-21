
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { API_URL } from './api'
import type { TamanhoEmpresa, Usuario } from './types'
import AreaLogada from './AreaLogada'
import Logo from './components/logo'

type Modo = 'login' | 'cadastro'

type ResultadoGoogle =
  | {
      status: 'GOOGLE_EXISTENTE'
      token: string
      user: Usuario
    }
  | {
      status: 'REGISTRO_PENDIENTE'
      cadastroToken: string
      email: string
    }

function App() {
  const [modo, setModo] = useState<Modo>('login')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [tamanho, setTamanho] = useState<TamanhoEmpresa | ''>('')
  const [numFuncionarios, setNumFuncionarios] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  const [cadastroGoogleToken, setCadastroGoogleToken] = useState<string | null>(null)
  const [emailGoogle, setEmailGoogle] = useState('')

  const cadastroPeloGoogle =
    modo === 'cadastro' && cadastroGoogleToken !== null

  // Recebe o retorno da autenticação Google.
  useEffect(() => {
    if (window.location.pathname !== '/auth/google/retorno') {
      return
    }

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    // Remove o código temporário da URL.
    window.history.replaceState({}, '', '/')

    if (!code) {
      setMensagem('No se recibió el código de autenticación de Google.')
      setErro(true)
      setVerificandoSessao(false)
      return
    }

    async function processarRetornoGoogle() {
      try {
        const resposta = await fetch(`${API_URL}/auth/google/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        const resultado = await resposta.json()

        if (!resposta.ok) {
          throw new Error(
            resultado.error || 'Error al iniciar sesión con Google.',
          )
        }

        const dados = resultado as ResultadoGoogle

        if (dados.status === 'GOOGLE_EXISTENTE') {
          sessionStorage.setItem('token', dados.token)
          setUsuario(dados.user)
          setMensagem('')
        } else if (dados.status === 'REGISTRO_PENDIENTE') {
          setCadastroGoogleToken(dados.cadastroToken)
          setEmailGoogle(dados.email)
          setEmail(dados.email)
          setModo('cadastro')
          setMensagem('')
        } else {
          throw new Error('Respuesta de autenticación no reconocida.')
        }
      } catch (error) {
        setMensagem(
          error instanceof Error
            ? error.message
            : 'No fue posible iniciar sesión con Google.',
        )
        setErro(true)
      } finally {
        setVerificandoSessao(false)
      }
    }

    void processarRetornoGoogle()
  }, [])

  // Verifica a sessão tradicional ao abrir o aplicativo.
  useEffect(() => {
    if (window.location.pathname === '/auth/google/retorno') {
      return
    }
    
    const parametros = new URLSearchParams(window.location.search)
    const erroGoogle = parametros.get('google_error')

    if (erroGoogle) {
      setMensagem(erroGoogle)
      setErro(true)

       // Remove a mensagem da URL depois de recebê-la.
      window.history.replaceState({}, '', window.location.pathname)
    } 
    
    async function verificarSessao() {
      const token = sessionStorage.getItem('token')

      if (!token) {
        setVerificandoSessao(false)
        return
      }

      try {
        const resposta = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!resposta.ok) {
          sessionStorage.removeItem('token')
          return
        }

        const resultado = await resposta.json()
        setUsuario(resultado.user)
      } catch {
        setMensagem('No fue posible verificar tu sesión.')
        setErro(true)
      } finally {
        setVerificandoSessao(false)
      }
    }

    void verificarSessao()
  }, [])

  function iniciarLoginGoogle() {
    window.location.assign(`${API_URL}/auth/google`)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMensagem('')
    setErro(false)
    setCarregando(true)

    try {
      const endpoint = cadastroPeloGoogle
        ? 'google/complete-registration'
        : modo === 'cadastro'
          ? 'register'
          : 'login'

      const dados = cadastroPeloGoogle
        ? {
            cadastroToken: cadastroGoogleToken,
            nomeEmpresa,
            tamanho,
            numFuncionarios: Number(numFuncionarios),
          }
        : modo === 'cadastro'
          ? {
              nomeEmpresa,
              email,
              password,
              tamanho,
              numFuncionarios: Number(numFuncionarios),
            }
          : {
              email,
              password,
            }

      const resposta = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      })

      const resultado = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          resultado.error ||
            resultado.message ||
            'No fue posible completar la operación.',
        )
      }

      sessionStorage.setItem('token', resultado.token)
      setUsuario(resultado.user)
      setMensagem('')
      setPassword('')
      setCadastroGoogleToken(null)
      setEmailGoogle('')
    } catch (error) {
      setErro(true)

      setMensagem(
        error instanceof Error
          ? error.message
          : 'No fue posible conectar con el servidor.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function trocarModo(novoModo: Modo) {
    setModo(novoModo)
    setMensagem('')
    setErro(false)
    setPassword('')
    setCadastroGoogleToken(null)
    setEmailGoogle('')
  }

  const sair = useCallback(() => {
    sessionStorage.removeItem('token')
    setUsuario(null)
    setModo('login')
    setMensagem('')
    setErro(false)
    setCadastroGoogleToken(null)
    setEmailGoogle('')
  }, [])

  if (verificandoSessao) {
    return (
      <main className="tela-carregamento">
        Verificando sesión...
      </main>
    )
  }

  if (usuario) {
    return <AreaLogada usuario={usuario} onSair={sair} />
  }

  return (
    <main className="pagina">
      <section className="apresentacao">
        <span className="marca">
          <Logo tamanho={125} />
        </span>

        <div className="apresentacao-conteudo">
          <span className="etiqueta">
            Tu empresa, en evolución
          </span>

          <h1>
            Conoce tu negocio.
            <br />
            Descubre cómo mejorar.
          </h1>

          <p>
            Responde algunas preguntas sobre tu empresa y recibe un
            diagnóstico con oportunidades de mejora y recomendaciones.
          </p>
        </div>

        <span className="rodape-apresentacao">
          Una nueva perspectiva para tu negocio.
        </span>
      </section>

      <section className="area-formulario">
        <div className="cartao">
          {!cadastroPeloGoogle && (
            <div className="alternador" aria-label="Tipo de acceso">
              <button
                type="button"
                className={modo === 'login' ? 'ativo' : ''}
                onClick={() => trocarModo('login')}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                className={modo === 'cadastro' ? 'ativo' : ''}
                onClick={() => trocarModo('cadastro')}
              >
                Crear cuenta
              </button>
            </div>
          )}

          <div className="titulo-formulario">
            <h2>
              {cadastroPeloGoogle
                ? 'Completa tu registro'
                : modo === 'login'
                  ? '¡Bienvenido(a) de nuevo!'
                  : 'Registra tu empresa'}
            </h2>

            <p>
              {cadastroPeloGoogle
                ? 'Completa los datos de tu empresa para continuar con Google.'
                : modo === 'login'
                  ? 'Inicia sesión para continuar a tu área de empresa.'
                  : 'Completa los datos para comenzar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {modo === 'cadastro' && (
              <>
                <div className="campo">
                  <label htmlFor="nomeEmpresa">
                    Nombre de la empresa
                  </label>
                  <input
                    id="nomeEmpresa"
                    type="text"
                    placeholder="Ej.: Mi Empresa"
                    value={nomeEmpresa}
                    onChange={(event) =>
                      setNomeEmpresa(event.target.value)
                    }
                    maxLength={150}
                    autoComplete="organization"
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="tamanho">
                    Tamaño de la empresa
                  </label>
                  <select
                    id="tamanho"
                    value={tamanho}
                    onChange={(event) =>
                      setTamanho(
                        event.target.value as TamanhoEmpresa | '',
                      )
                    }
                    required
                  >
                    <option value="" disabled>
                      Selecciona una opción
                    </option>
                    <option value="MICRO">Microempresa</option>
                    <option value="PEQUENA">Pequeña empresa</option>
                    <option value="MEDIA">Mediana empresa</option>
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="numFuncionarios">
                    Cantidad de funcionarios
                  </label>
                  <input
                    id="numFuncionarios"
                    type="number"
                    min={1}
                    max={100000}
                    step={1}
                    placeholder="Ej.: 8"
                    value={numFuncionarios}
                    onChange={(event) =>
                      setNumFuncionarios(event.target.value)
                    }
                    required
                  />
                </div>
              </>
            )}

            {cadastroPeloGoogle ? (
              <div className="campo">
                <label htmlFor="emailGoogle">
                  Correo electrónico de Google
                </label>
                <input
                  id="emailGoogle"
                  type="email"
                  value={emailGoogle}
                  readOnly
                />
              </div>
            ) : (
              <>
                <div className="campo">
                  <label htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete={
                      modo === 'cadastro'
                        ? 'new-password'
                        : 'current-password'
                    }
                    minLength={
                      modo === 'cadastro' ? 8 : undefined
                    }
                    required
                  />
                </div>
              </>
            )}

            {mensagem && (
              <p
                className={`mensagem ${
                  erro ? 'mensagem-erro' : 'mensagem-sucesso'
                }`}
                role="status"
              >
                {mensagem}
              </p>
            )}

            <button
              className="botao-principal"
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? 'Espera...'
                : cadastroPeloGoogle
                  ? 'Completar registro'
                  : modo === 'login'
                    ? 'Ingresar a mi cuenta'
                    : 'Crear mi cuenta'}
            </button>
          </form>

          {!cadastroPeloGoogle && (
            <>
              <div className="separador-google">
                <span>o continúa con</span>
              </div>

              <button
                type="button"
                className="botao-google"
                onClick={iniciarLoginGoogle}
                disabled={carregando}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 5.38 6.51 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.89 46.98 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continuar con Google
              </button>
            </>
          )}

          {cadastroPeloGoogle ? (
            <p className="alternativa">
              <button
                type="button"
                onClick={() => trocarModo('login')}
              >
                Volver al inicio de sesión
              </button>
            </p>
          ) : (
            <p className="alternativa">
              {modo === 'login'
                ? '¿Aún no tienes una cuenta?'
                : '¿Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() =>
                  trocarModo(
                    modo === 'login' ? 'cadastro' : 'login',
                  )
                }
              >
                {modo === 'login'
                  ? 'Registra tu empresa'
                  : 'Iniciar sesión'}
              </button>
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
