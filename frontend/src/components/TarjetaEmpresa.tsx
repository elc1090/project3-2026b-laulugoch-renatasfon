import { useEffect, useState } from 'react'
import { apiFetch, mensagemDeErro } from '../api'
import type { TamanhoEmpresa, Usuario } from '../types'

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
  const [progresso, setProgresso] = useState<ProgressoAcademia | null>(null)
  const [carregandoAcademia, setCarregandoAcademia] = useState(true)
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
        const dados = await apiFetch<ProgressoAcademia>('/academia')

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
      <span className="etiqueta">Mi empresa</span>

      <h1>{usuario.nomeEmpresa}</h1>

      <dl className="empresa-datos">
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

      <div className="empresa-mensaje">
        <h2>¡Bienvenido(a) a EcoSME!</h2>

        <p>
          Estamos aquí para acompañarte en el camino hacia una empresa más
          sostenible. Primero conoceremos dónde estás con un diagnóstico en
          tres dimensiones: ambiental, social y económica.
        </p>

        <p>
          Con ese resultado armaremos un plan de acción con pasos concretos y
          te ayudaremos a seguir tu avance, para que cada mejora cuente.
        </p>
      </div>

      <div className="empresa-conquistas">
        <h2>Mis Insignias Sostenibles</h2>

        {carregandoAcademia ? (
          <p>Consultando tus logros...</p>
        ) : erroAcademia ? (
          <p className="mensagem mensagem-erro" role="alert">
            {erroAcademia}
          </p>
        ) : progresso?.concluido ? (
          <div className="empresa-insignia">
            <span className="empresa-insignia-icone" aria-hidden="true">
              🏅
            </span>

            <div>
              <h3>{progresso.insignia}</h3>

              <p>
                Has completado el cuestionario de Academia ODS.
              </p>

              <p>
                Mejor resultado: {progresso.melhorPontuacao} de 5
              </p>

              {progresso.concluidoEm && (
                <p>
                  Obtenida el{' '}
                  {new Date(progresso.concluidoEm).toLocaleDateString('es-CL')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p>
            Aún no tienes insignias. Completa el cuestionario de Academia ODS
            para conseguir tu primera insignia sostenible.
          </p>
        )}
      </div>
    </section>
  )
}

export default TarjetaEmpresa