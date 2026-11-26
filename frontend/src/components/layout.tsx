import type { ReactNode } from 'react'
import Logo from './logo'
import CaixaSugestoes from './CaixaSugestoes'
import IconeMenu from './IconeMenu'
import './Layout.css'

export type Tela =
  | 'inicio'
  | 'diagnostico'
  | 'resultado'
  | 'plano'
  | 'academia'
  | 'radar'

const MENU: {
  tela: Tela
  rotulo: string
  exigeResultado: boolean
}[] = [
  {
    tela: 'inicio',
    rotulo: 'Mi Empresa',
    exigeResultado: false,
  },
  {
    tela: 'diagnostico',
    rotulo: 'Diagnóstico',
    exigeResultado: false,
  },
  {
    tela: 'resultado',
    rotulo: 'Resultado',
    exigeResultado: true,
  },
  {
    tela: 'plano',
    rotulo: 'Mi Plan',
    exigeResultado: true,
  },
  {
    tela: 'academia',
    rotulo: 'Academia ODS',
    exigeResultado: false,
  },
  {
    tela: 'radar',
    rotulo: 'Radar de Oportunidades',
    exigeResultado: false,
  },
]

const ETAPAS = MENU.filter(
  (item) =>
    item.tela !== 'academia' &&
    item.tela !== 'radar',
)

type Props = {
  nomeEmpresa: string
  telaAtual: Tela
  temResultado: boolean
  onNavegar: (tela: Tela) => void
  onSair: () => void
  children: ReactNode
}

function Layout({
  nomeEmpresa,
  telaAtual,
  temResultado,
  onNavegar,
  onSair,
  children,
}: Props) {
  const indiceAtual = ETAPAS.findIndex(
    (etapa) => etapa.tela === telaAtual,
  )

  const paginaAtual = MENU.find(
    (item) => item.tela === telaAtual,
  )

  return (
    <div className="layout">
      <aside className="menu-lateral">
        <div className="menu-lateral-topo">
          <Logo tamanho={80} />

          <span
            className="menu-empresa"
            title={nomeEmpresa}
          >
            {nomeEmpresa}
          </span>
        </div>

        <nav
          className="menu-lateral-nav"
          aria-label="Menú principal"
        >
          {MENU.map((item) => {
            const desabilitada =
              item.exigeResultado && !temResultado

            return (
              <button
                key={item.tela}
                type="button"
                className={
                  item.tela === telaAtual ? 'ativo' : ''
                }
                disabled={desabilitada}
                aria-current={
                  item.tela === telaAtual
                    ? 'page'
                    : undefined
                }
                onClick={() => onNavegar(item.tela)}
              >
                <IconeMenu nome={item.tela} />
                <span>{item.rotulo}</span>
              </button>
            )
          })}
        </nav>

        <div
          className="menu-decoracao"
          aria-hidden="true"
        >
          <span />
          <span />
        </div>

        <button
          type="button"
          className="menu-sair"
          onClick={onSair}
        >
          <IconeMenu nome="sair" />
          Cerrar sesión
        </button>
      </aside>

      <div className="layout-corpo">
        <header className="layout-cabecalho">
          <div>
            <span className="layout-pagina-atual">
              {paginaAtual?.rotulo}
            </span>

            {telaAtual === 'inicio' && (
              <h1>Panel de Gestión Sostenible</h1>
            )}
          </div>

          <div className="layout-identificacao">
            <IconeMenu nome="inicio" tamanho={19} />
            <span>{nomeEmpresa}</span>
          </div>
        </header>
      
      {telaAtual === 'inicio' && (
        <section className="inicio-boas-vindas">
          <div className="inicio-boas-vindas-texto">
            <span className="inicio-boas-vindas-etiqueta">
              TU EMPRESA EN CONSTANTE EVOLUCIÓN
            </span>

            <h2>¡Bienvenido(a) a EcoSME!</h2>

             <p>
                Estamos aquí para acompañarte en el camino
                hacia una empresa más sostenible.
            </p>

             <p>
                Conoce tu negocio, descubre oportunidades
                de mejora y transforma tus acciones en un
                impacto positivo.
             </p>
           </div>
         </section>
       )}

        {indiceAtual >= 0 && (
          <section className="progresso-painel">
            <div className="progresso-titulo">
              <span className="progresso-icone">
                <IconeMenu nome="progresso" />
              </span>
              <strong>Tu progreso</strong>
            </div>

            <ol
              className="barra-etapas"
              aria-label="Tu recorrido en la plataforma"
            >
              {ETAPAS.map((etapa, indice) => {
                const estado =
                  indice < indiceAtual
                    ? 'concluida'
                    : indice === indiceAtual
                      ? 'atual'
                      : ''

                return (
                  <li
                    key={etapa.tela}
                    className={`etapa ${estado}`}
                    aria-current={
                      indice === indiceAtual
                        ? 'step'
                        : undefined
                    }
                  >
                    <span className="etapa-numero">
                      {indice < indiceAtual
                        ? '✓'
                        : indice + 1}
                    </span>

                    <span className="etapa-rotulo">
                      {etapa.rotulo}
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        <main className="layout-conteudo">
          {children}
        </main>
      </div>

      <CaixaSugestoes />
    </div>
  )
}

export default Layout