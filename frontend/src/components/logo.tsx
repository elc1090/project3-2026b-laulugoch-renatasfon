type Props = {
  tamanho?: number
}

function Logo({ tamanho = 32 }: Props) {
  return (
    <span className="logo">
      <svg
        width={tamanho}
        height={tamanho}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#246b59" />
        <path
          d="M23 8c-8 0-13 4-13 10 0 1.4.3 2.6.9 3.6C12.2 17.6 15 15 19 13.5c-3 2-5.2 4.6-6.5 8 1 .6 2.2.9 3.5.9 6 0 8-6 7-14.4z"
          fill="#ffffff"
        />
      </svg>
      <span className="logo-texto">EcoSME</span>
    </span>
  )
}

export default Logo