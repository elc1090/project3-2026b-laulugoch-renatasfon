import { GoogleGenAI } from "@google/genai";

// configurações da API
const apiKey = process.env.GEMINI_API_KEY;
const modelo = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// verifica se a chave foi configurada
if (!apiKey) {
  throw new Error("Configure GEMINI_API_KEY no arquivo .env");
}

// cria o cliente que se comunica com o gemini
const ai = new GoogleGenAI({ apiKey });

// testa a conexão com a IA
export async function testarGemini(): Promise<string> {
  const resposta = await ai.models.generateContent({
    model: modelo,
    contents:
      "Responde en español con una sola frase: ¿por qué es importante la sostenibilidad para las pequeñas empresas?",
  });

  return resposta.text ?? "La IA no devolvió una respuesta.";
}

export type DadosPlanoIA = {
  empresa: {
    nomeEmpresa: string;
    tamanho: string | null;
    numFuncionarios: number | null;
  };
  diagnostico: {
    pontuacao: number;
    nivel: string;
    dimensoes: {
      dimensao: string;
      pontuacao: number;
    }[];
    respostas: {
      dimensao: string;
      pergunta: string;
      valor: number;
    }[];
  };
};

export type RecomendacaoIA = {
  dimensao: "AMBIENTAL" | "SOCIAL" | "ECONOMICA";
  titulo: string;
  justificativa: string;
  prioridade: "Alta" | "Media" | "Baja";
  prazo: string;
  passos: string[];
  indicador: string;
  ods: number[];
};

export type PlanoIA = { recomendacoes: RecomendacaoIA[] };

export async function gerarPlanoIA(dados: DadosPlanoIA): Promise<PlanoIA> {
  const prompt = `
Eres un consultor especializado en sostenibilidad para pequeñas y medianas empresas.

Tu tarea es generar un plan de acción personalizado a partir de un diagnóstico.

DATOS DE LA EMPRESA:
${JSON.stringify(dados.empresa, null, 2)}

RESULTADOS DEL DIAGNÓSTICO:
${JSON.stringify(dados.diagnostico, null, 2)}

ESCALA DE RESPUESTAS:
10 = Sí, completamente
5 = Parcialmente / En proceso
0 = No

INSTRUCCIONES:
1. Responde exclusivamente en español.
2. Analiza las respuestas individuales, no solamente las puntuaciones.
3. Prioriza las dimensiones con puntuaciones inferiores a 60.
4. Propón acciones realistas para el tamaño de la empresa.
5. No inventes información sobre el sector de actividad de la empresa.
6. Sugiere acciones de bajo costo siempre que sea posible.
7. Para cada recomendación, incluye:
   - Dimensión.
   - Título.
   - Justificación basada en el diagnóstico.
   - Prioridad (Alta, Media o Baja).
   - Plazo estimado.
   - Tres pasos prácticos.
   - Indicador de seguimiento.
   - ODS relacionado.
8. Genera entre 3 y 5 recomendaciones.
9. No modifiques ni recalcules las puntuaciones del diagnóstico.
10. No afirmes que una práctica existe si las respuestas no lo demuestran.

Devuelve exclusivamente un objeto JSON con la clave "recomendacoes", que contiene una lista de 3 a 5 objetos.
Cada objeto debe tener: dimensao (AMBIENTAL, SOCIAL o ECONOMICA), titulo, justificativa,
prioridade (Alta, Media o Baja), prazo, passos (exactamente 3 strings), indicador, ods (array de números entre 1 y 17).
No incluyas Markdown ni texto adicional.
`;

  const resposta = await ai.models.generateContent({
    model: modelo,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  if (!resposta.text?.trim()) {
    throw new Error("Gemini no devolvió un plan de acción.");
  }

  let plano: unknown;
  try {
    plano = JSON.parse(resposta.text);
  } catch {
    throw new Error("Gemini devolvió JSON inválido.");
  }
  if (!plano || typeof plano !== "object" || !("recomendacoes" in plano) ||
      !Array.isArray(plano.recomendacoes) || plano.recomendacoes.length < 3 || plano.recomendacoes.length > 5) {
    throw new Error("El plan generado tiene una estructura inválida.");
  }
  const dimensoes = ["AMBIENTAL", "SOCIAL", "ECONOMICA"];
  for (const r of plano.recomendacoes) {
    if (!r || !dimensoes.includes(r.dimensao) ||
      !["Alta", "Media", "Baja"].includes(r.prioridade) ||
      ![r.titulo, r.justificativa, r.prazo, r.indicador].every((v) => typeof v === "string" && v.trim()) ||
      !Array.isArray(r.passos) || r.passos.length !== 3 || !r.passos.every((v: unknown) => typeof v === "string" && v.trim()) ||
      !Array.isArray(r.ods) || !r.ods.every((v: unknown) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 17)) {
      throw new Error("Las recomendaciones generadas son inválidas.");
    }
  }
  return plano as PlanoIA;
}