import logoEcoSME from '../assets/logo-ecosme.png'

type Props = {
  tamanho?: number
}

function Logo({ tamanho = 32 }: Props) {
  return (
    <span className="logo">
      <img
        src={logoEcoSME}
        alt="EcoSME"
        height={tamanho}
        style={{ display: 'block' }}
      />
    </span>
  )
}

export default Logo