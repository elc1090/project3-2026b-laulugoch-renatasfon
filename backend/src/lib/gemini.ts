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

export async function gerarPlanoIA(dados: DadosPlanoIA): Promise<string> {
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

Genera el plan de acción de forma clara, organizada y fácil de comprender.
`;

  const resposta = await ai.models.generateContent({
    model: modelo,
    contents: prompt,
  });

  if (!resposta.text?.trim()) {
    throw new Error("Gemini no devolvió un plan de acción.");
  }

  return resposta.text;
}