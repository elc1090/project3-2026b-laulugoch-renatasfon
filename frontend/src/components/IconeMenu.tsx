type Props = {
  nome: string
  tamanho?: number
}

export default function IconeMenu({
  nome,
  tamanho = 22,
}: Props) {
  const icones: Record<string, React.ReactNode> = {
    inicio: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    diagnostico: (
      <>
        <rect x="5" y="4" width="14" height="18" rx="2" />
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M9 11h6M9 15h6M9 19h4" />
      </>
    ),
    resultado: (
      <>
        <path d="M3 3v18h18" />
        <rect x="7" y="13" width="3" height="5" />
        <rect x="12" y="9" width="3" height="9" />
        <rect x="17" y="5" width="3" height="13" />
      </>
    ),
    plano: (
      <>
        <path d="m3 6 2 2 4-4M11 6h10" />
        <path d="m3 12 2 2 4-4M11 12h10" />
        <path d="m3 18 2 2 4-4M11 18h10" />
      </>
    ),
    academia: (
      <>
        <path d="m2 10 10-5 10 5-10 5-10-5Z" />
        <path d="M6 12v6c4 3 8 3 12 0v-6" />
        <path d="M22 10v7" />
      </>
    ),
    radar: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
        <path d="m12 12 8-8" />
      </>
    ),
    progresso: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 15 5-5 4 4 5-8" />
        <path d="M16 6h5v5" />
      </>
    ),
    sair: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
  }

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {icones[nome]}
    </svg>
  )
}