import type { TamanhoEmpresa, Usuario } from '../types'

const NOMBRE_TAMANO: Record<TamanhoEmpresa, string> = {
  MICRO: 'Microempresa',
  PEQUENA: 'Pequeña empresa',
  MEDIA: 'Mediana empresa',
}

type Props = {
  usuario: Usuario
}

function TarjetaEmpresa({ usuario }: Props) {
  const tamano = usuario.tamanho
    ? NOMBRE_TAMANO[usuario.tamanho]
    : 'No informado'

  const funcionarios =
    usuario.numFuncionarios != null
      ? String(usuario.numFuncionarios)
      : 'No informado'

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
    </section>
  )
}

export default TarjetaEmpresa