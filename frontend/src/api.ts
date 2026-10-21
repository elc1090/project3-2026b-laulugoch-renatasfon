
export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem('token')

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    throw new ApiError(
      dados?.error ||
        dados?.message ||
        'No fue posible completar la operación.',
      resposta.status,
    )
  }

  return dados as T
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) {
    return erro.message
  }

  return 'No fue posible conectar con el servidor.'
}