import type { ReactNode } from 'react'
import Logo from './logo'

export type Tela =
  | 'inicio'
  | 'diagnostico'
  | 'resultado'
  | 'plano'
  | 'acompanhamento'

const ETAPAS: { tela: Tela; rotulo: string; exigeResultado: boolean }[] = [
  { tela: 'inicio', rotulo: 'Mi Empresa', exigeResultado: false },
  { tela: 'diagnostico', rotulo: 'Diagnóstico', exigeResultado: false },
  { tela: 'resultado', rotulo: 'Resultado', exigeResultado: true },
  { tela: 'plano', rotulo: 'Mi Plan', exigeResultado: true },
  { tela: 'acompanhamento', rotulo: 'Seguimiento', exigeResultado: true },
]

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
  const indiceAtual = ETAPAS.findIndex((etapa) => etapa.tela === telaAtual)

  return (
    <div className="layout">
      <aside className="menu-lateral">
        <div className="menu-lateral-topo">
          <Logo tamanho={80}/>
          <span className="menu-empresa" title={nomeEmpresa}>
            {nomeEmpresa}
          </span>
        </div>

        <nav className="menu-lateral-nav" aria-label="Menú principal">
          {ETAPAS.map((etapa) => {
            const desabilitada = etapa.exigeResultado && !temResultado

            return (
              <button
                key={etapa.tela}
                type="button"
                className={etapa.tela === telaAtual ? 'ativo' : ''}
                disabled={desabilitada}
                aria-current={etapa.tela === telaAtual ? 'page' : undefined}
                onClick={() => onNavegar(etapa.tela)}
              >
                {etapa.rotulo}
              </button>
            )
          })}
        </nav>

        <button type="button" className="menu-sair" onClick={onSair}>
          Cerrar sesión
        </button>
      </aside>

      <div className="layout-corpo">
        <ol className="barra-etapas" aria-label="Tu recorrido en la plataforma">
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
                aria-current={indice === indiceAtual ? 'step' : undefined}
              >
                <span className="etapa-numero">
                  {indice < indiceAtual ? '✓' : indice + 1}
                </span>
                <span className="etapa-rotulo">{etapa.rotulo}</span>
              </li>
            )
          })}
        </ol>

        <main className="layout-conteudo">{children}</main>
      </div>
    </div>
  )
}

export default Layout