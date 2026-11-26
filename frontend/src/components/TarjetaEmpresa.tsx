import { useEffect, useState } from 'react'
import { apiFetch, mensagemDeErro } from '../api'
import type { TamanhoEmpresa, Usuario } from '../types'
import IconeMenu from './IconeMenu'

const NOMBRE_TAMANO: Record<TamanhoEmpresa, string> = {
  MICRO: 'Microempresa',
  PEQUENA: 'Pequeña empresa',
  MEDIA: 'Mediana empresa',
}

type ProgressoAcademia = {
  concluido: boolean
  melhorPontuacao: number | null
  concluidoEm: string | null
  insignia: string | null
}

type Props = {
  usuario: Usuario
}

function TarjetaEmpresa({ usuario }: Props) {
  const [progresso, setProgresso] =
    useState<ProgressoAcademia | null>(null)

  const [carregandoAcademia, setCarregandoAcademia] =
    useState(true)

  const [erroAcademia, setErroAcademia] = useState('')

  const tamano = usuario.tamanho
    ? NOMBRE_TAMANO[usuario.tamanho]
    : 'No informado'

  const funcionarios =
    usuario.numFuncionarios != null
      ? String(usuario.numFuncionarios)
      : 'No informado'

  useEffect(() => {
    let ativo = true

    async function carregarProgresso() {
      try {
        const dados =
          await apiFetch<ProgressoAcademia>('/academia')

        if (ativo) {
          setProgresso(dados)
        }
      } catch (error) {
        if (ativo) {
          setErroAcademia(mensagemDeErro(error))
        }
      } finally {
        if (ativo) {
          setCarregandoAcademia(false)
        }
      }
    }

    carregarProgresso()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <section className="tarjeta-empresa">
      <header className="inicio-card-cabecalho">
        <span className="inicio-card-icone">
          <IconeMenu nome="inicio" tamanho={25} />
        </span>

        <div>
          <h2>Mi Empresa</h2>
          <p>Información de tu empresa</p>
        </div>
      </header>

      <dl className="empresa-datos">
        <div>
          <dt>Nombre de la empresa</dt>
          <dd>{usuario.nomeEmpresa}</dd>
        </div>

        <div>
          <dt>Tamaño</dt>
          <dd>{tamano}</dd>
        </div>

        <div>
          <dt>Funcionarios</dt>
          <dd>{funcionarios}</dd>
        </div>

        <div>
          <dt>Correo electrónico</dt>
          <dd>{usuario.email}</dd>
        </div>
      </dl>

      <div className="empresa-conquistas">
        <h2>Mis Insignias Sostenibles</h2>

        {carregandoAcademia ? (
          <p>Consultando tus logros...</p>
        ) : erroAcademia ? (
          <p
            className="mensagem mensagem-erro"
            role="alert"
          >
            {erroAcademia}
          </p>
        ) : progresso?.concluido ? (
          <div className="empresa-insignia">
            <span
              className="empresa-insignia-icone"
              aria-hidden="true"
            >
              <svg
                width="64"
                height="72"
                viewBox="0 0 64 72"
                fill="none"
              >
                <path
                  d="M19 40L12 69L25 61L32 70L39 61L52 69L45 40"
                  fill="#168443"
                />

                <circle
                  cx="32"
                  cy="28"
                  r="25"
                  fill="#e7f4e9"
                  stroke="#168443"
                  strokeWidth="3"
                />

                <circle
                  cx="32"
                  cy="28"
                  r="19"
                  stroke="#86cb92"
                  strokeWidth="1.5"
                />

                <path
                  d="M22 37C19 19 35 13 45 17C44 32 35 40 22 37Z"
                  fill="#168443"
                />

                <path
                  d="M21 40L36 24"
                  stroke="#005432"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <div>
              <h3>{progresso.insignia}</h3>

              <p>
                Has completado el cuestionario de
                Academia ODS.
              </p>

              <p className="empresa-insignia-pontuacao">
                Mejor resultado: {progresso.melhorPontuacao} de 5
              </p>

              {progresso.concluidoEm && (
                <p className="empresa-insignia-data">
                  Obtenida el{' '}
                  {new Date(
                    progresso.concluidoEm,
                  ).toLocaleDateString('es-CL')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="empresa-sem-insignia">
            <p>
              Aún no tienes insignias. Completa el
              cuestionario de Academia ODS para
              conseguir tu primera insignia sostenible.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default TarjetaEmpresa