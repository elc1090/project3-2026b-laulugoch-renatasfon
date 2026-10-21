
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './App.css'
import type { Usuario } from './types'
import AreaLogada from './AreaLogada'
import Logo from './components/logo'

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
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
        setMensagem('Não foi possível verificar sua sessão.')
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
              ? { nomeEmpresa, email, password }
              : { email, password },
          ),
        },
      )

      const resultado = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          resultado.error ||
            resultado.message ||
            'Não foi possível realizar a operação.',
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
        setMensagem('Não foi possível conectar ao servidor.')
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
    return <main className="tela-carregamento">Verificando sessão...</main>
  }

  if (usuario) {
    return <AreaLogada usuario={usuario} onSair={sair} />
  }

  return (
    <main className="pagina">
      <section className="apresentacao">
        <span className="marca"><Logo tamanho={132} /></span>

        <div className="apresentacao-conteudo">
          <span className="etiqueta">Sua empresa, em evolução</span>

          <h1>
            Entenda seu negócio.
            <br />
            Descubra como melhorar.
          </h1>

          <p>
            Responda a algumas perguntas sobre sua empresa e receba um
            diagnóstico com oportunidades de melhoria e recomendações.
          </p>
        </div>

        <span className="rodape-apresentacao">
          Uma nova perspectiva para o seu negócio.
        </span>
      </section>

      <section className="area-formulario">
        <div className="cartao">
          <div className="alternador" aria-label="Tipo de acesso">
            <button
              type="button"
              className={modo === 'login' ? 'ativo' : ''}
              onClick={() => trocarModo('login')}
            >
              Entrar
            </button>

            <button
              type="button"
              className={modo === 'cadastro' ? 'ativo' : ''}
              onClick={() => trocarModo('cadastro')}
            >
              Criar conta
            </button>
          </div>

          <div className="titulo-formulario">
            <h2>
              {modo === 'login'
                ? 'Bem-vinda de volta!'
                : 'Cadastre sua empresa'}
            </h2>
            <p>
              {modo === 'login'
                ? 'Entre para continuar para sua área empresarial.'
                : 'Preencha os dados para começar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {modo === 'cadastro' && (
              <div className="campo">
                <label htmlFor="nomeEmpresa">Nome da empresa</label>
                <input
                  id="nomeEmpresa"
                  type="text"
                  placeholder="Ex.: Minha Empresa"
                  value={nomeEmpresa}
                  onChange={(event) => setNomeEmpresa(event.target.value)}
                  maxLength={150}
                  autoComplete="organization"
                  required
                />
              </div>
            )}

            <div className="campo">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo de 8 caracteres"
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
                ? 'Aguarde...'
                : modo === 'login'
                  ? 'Entrar na minha conta'
                  : 'Criar minha conta'}
            </button>
          </form>

          <p className="alternativa">
            {modo === 'login'
              ? 'Ainda não tem uma conta?'
              : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() =>
                trocarModo(modo === 'login' ? 'cadastro' : 'login')
              }
            >
              {modo === 'login' ? 'Cadastre sua empresa' : 'Fazer login'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default App