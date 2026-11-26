import './RadarOportunidades.css'
import IconeMenu from './components/IconeMenu'

type Oportunidade = {
  titulo: string
  subtitulo: string
  descricao: string
  link: string
  orientacao?: string
}

type Categoria = {
  titulo: string
  icone: string
  oportunidades: Oportunidade[]
}

const categorias: Categoria[] = [
  {
    titulo: 'Fondos de Financiamiento',
    icone: 'progresso',
    oportunidades: [
      {
        titulo: 'Sercotec',
        subtitulo: 'Fondos para Micro y Pequeñas Empresas',
        descricao:
          'Financiamiento para digitalización, crecimiento y mejora de negocios, como Capital Abeja, Crece y Ruta Digital.',
        link: 'https://www.sercotec.cl',
        orientacao: 'Consulta la sección de noticias.',
      },
      {
        titulo: 'Corfo',
        subtitulo: 'Innovación y Sostenibilidad',
        descricao:
          'Programas de apoyo y cofinanciamiento para innovación empresarial, economía circular y transformación productiva.',
        link: 'https://www.corfo.cl',
        orientacao: 'Consulta los programas de apoyo en sostenibilidad.',
      },
    ],
  },
  {
    titulo: 'Normativas Actualizadas',
    icone: 'diagnostico',
    oportunidades: [
      {
        titulo: 'Oficina de Economía Circular y Ley REP',
        subtitulo: 'Legislación ambiental en Chile',
        descricao:
          'Información oficial sobre la Ley de Responsabilidad Extendida del Productor y la Ley de Plásticos de un Solo Uso (Ley 21.368).',
        link: 'https://economiacircular.mma.gob.cl',
      },
    ],
  },
  {
    titulo: 'Noticias y Recursos de Sostenibilidad',
    icone: 'radar',
    oportunidades: [
      {
        titulo: 'Ministerio del Medio Ambiente',
        subtitulo: 'Noticias y programas ambientales',
        descricao:
          'Novedades sobre normativas ambientales, programas verdes y certificaciones en Chile.',
        link: 'https://mma.gob.cl',
      },
      {
        titulo: 'Agencia de Sostenibilidad Energética',
        subtitulo: 'Eficiencia energética para PyMEs',
        descricao:
          'Guías prácticas, noticias y programas de eficiencia energética para reducir costos eléctricos en PyMEs.',
        link: 'https://www.agenciase.org',
      },
    ],
  },
]

export default function RadarOportunidades() {
  return (
    <section className="radar-oportunidades">
      <header className="radar-cabecalho">
        <div className="radar-cabecalho-icone">
          <IconeMenu nome="radar" tamanho={32} />
        </div>
        <div className="radar-cabecalho-texto">
          <span className="radar-banner-etiqueta">CRECE DE FORMA SOSTENIBLE</span>
          <h1>Radar de Oportunidades</h1>

        <p>
          Descubre oportunidades de financiamiento, normativas
          y recursos para impulsar el crecimiento sostenible
          de tu empresa.
        </p>
        </div>
      </header>

      {categorias.map((categoria) => (
        <section
          className="radar-categoria"
          key={categoria.titulo}
        >
          <h2>
            <span className="radar-categoria-icone" aria-hidden="true">
              <IconeMenu nome={categoria.icone} tamanho={23} />
            </span>
            {categoria.titulo}
          </h2>

          <div className="radar-grid">
            {categoria.oportunidades.map((oportunidade) => (
              <article
                className="radar-card"
                key={oportunidade.titulo}
              >
                <span className="radar-etiqueta">
                  Fuente oficial
                </span>

                <h3>{oportunidade.titulo}</h3>

                <span className="radar-subtitulo">
                  {oportunidade.subtitulo}
                </span>

                <p>{oportunidade.descricao}</p>

                {oportunidade.orientacao && (
                  <small className="radar-orientacao">
                    {oportunidade.orientacao}
                  </small>
                )}

                <a
                  className="radar-link"
                  href={oportunidade.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visitar sitio oficial <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      <footer className="radar-aviso">
        Consulta los sitios oficiales para conocer las
        convocatorias vigentes, sus requisitos, plazos y
        actualizaciones normativas.
      </footer>
    </section>
  )
}