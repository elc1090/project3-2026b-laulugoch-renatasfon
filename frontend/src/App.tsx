import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './App.css'
import type { TamanhoEmpresa, Usuario } from './types'
import AreaLogada from './AreaLogada'
import Logo from './components/logo'

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
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

  useEffect(() => {
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

    verificarSessao()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMensagem('')
    setErro(false)
    setCarregando(true)

    try {
      const resposta = await fetch(
        `${API_URL}/auth/${modo === 'cadastro' ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            modo === 'cadastro'
              ? {
                  nomeEmpresa,
                  email,
                  password,
                  tamanho,
                  numFuncionarios: Number(numFuncionarios),
                }
              : { email, password },
          ),
        },
      )

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
    } catch (error) {
      setErro(true)

      if (error instanceof Error) {
        setMensagem(error.message)
      } else {
        setMensagem('No fue posible conectar con el servidor.')
      }
    } finally {
      setCarregando(false)
    }
  }

  function trocarModo(novoModo: 'login' | 'cadastro') {
    setModo(novoModo)
    setMensagem('')
    setErro(false)
    setPassword('')
  }

  const sair = useCallback(() => {
    sessionStorage.removeItem('token')
    setUsuario(null)
    setModo('login')
    setMensagem('')
    setErro(false)
  }, [])

  if (verificandoSessao) {
    return <main className="tela-carregamento">Verificando sesión...</main>
  }

  if (usuario) {
    return <AreaLogada usuario={usuario} onSair={sair} />
  }

  return (
    <main className="pagina">
      <section className="apresentacao">
        <span className="marca"><Logo tamanho={125} /></span>

        <div className="apresentacao-conteudo">
          <span className="etiqueta">Tu empresa, en evolución</span>

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

          <div className="titulo-formulario">
            <h2>
              {modo === 'login'
                ? '¡Bienvenido(a) de nuevo!'
                : 'Registra tu empresa'}
            </h2>
            <p>
              {modo === 'login'
                ? 'Inicia sesión para continuar a tu área de empresa.'
                : 'Completa los datos para comenzar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {modo === 'cadastro' && (
              <>
                <div className="campo">
                  <label htmlFor="nomeEmpresa">Nombre de la empresa</label>
                  <input
                    id="nomeEmpresa"
                    type="text"
                    placeholder="Ej.: Mi Empresa"
                    value={nomeEmpresa}
                    onChange={(event) => setNomeEmpresa(event.target.value)}
                    maxLength={150}
                    autoComplete="organization"
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="tamanho">Tamaño de la empresa</label>
                  <select
                    id="tamanho"
                    value={tamanho}
                    onChange={(event) =>
                      setTamanho(event.target.value as TamanhoEmpresa | '')
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
                    onChange={(event) => setNumFuncionarios(event.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  modo === 'cadastro' ? 'new-password' : 'current-password'
                }
                minLength={modo === 'cadastro' ? 8 : undefined}
                required
              />
            </div>

            {mensagem && (
              <p
                className={`mensagem ${erro ? 'mensagem-erro' : 'mensagem-sucesso'}`}
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
                : modo === 'login'
                  ? 'Ingresar a mi cuenta'
                  : 'Crear mi cuenta'}
            </button>
          </form>

          <p className="alternativa">
            {modo === 'login'
              ? '¿Aún no tienes una cuenta?'
              : '¿Ya tienes una cuenta?'}{' '}
            <button
              type="button"
              onClick={() =>
                trocarModo(modo === 'login' ? 'cadastro' : 'login')
              }
            >
              {modo === 'login' ? 'Registra tu empresa' : 'Iniciar sesión'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default App