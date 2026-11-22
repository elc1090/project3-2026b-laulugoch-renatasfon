type DadosFeedback = {
  empresa: string;
  avaliacao: number;
  comentario: string;
};

export async function enviarFeedbackPlanilha(dados: DadosFeedback) {
  const url = process.env.GOOGLE_SHEETS_URL;
  const chave = process.env.GOOGLE_SHEETS_CHAVE;

  if (!url || !chave) {
    throw new Error("Google Sheets não configurado");
  }

  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      chave,
      empresa: dados.empresa,
      avaliacao: dados.avaliacao,
      comentario: dados.comentario,
    }),
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!resposta.ok) {
    throw new Error(
      `Erro HTTP ao enviar feedback para Google Sheets: ${resposta.status}`
    );
  }

  const resultado = await resposta.json();

  if (resultado.sucesso !== true) {
    throw new Error(
      resultado.erro || "Google Sheets não confirmou o recebimento"
    );
  }
}