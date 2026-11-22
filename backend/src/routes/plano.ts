import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calcularResultado, LIMITE_PLANO } from "../lib/diagnostico.js";
import { CATALOGO, REFORCO } from "../lib/plano.js";
import { testarGemini, gerarPlanoIA } from "../lib/gemini.js";

const router = Router();

// calculado a partir do último diagnóstico
router.get("/", requireAuth, async (_req, res) => {
  try {
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      include: { respostas: { include: { pergunta: true } } },
    });

    if (!diagnostico) {
      res.status(404).json({
        error: "Realiza el diagnóstico antes de ver el plan de acción",
      });
      return;
    }

    const resultado = calcularResultado(
      diagnostico.respostas.map((r) => ({
        valor: r.valor,
        dimensao: r.pergunta.dimensao,
      })),
    );

    const dimensoes = resultado.dimensoes.map(({ dimensao, pontuacao }) => {
      if (pontuacao < LIMITE_PLANO) {
        return {
          dimensao,
          pontuacao,
          situacao: "ACAO" as const,
          acao: CATALOGO[dimensao],
        };
      }

      return {
        dimensao,
        pontuacao,
        situacao: "REFORCO" as const,
        reforco: REFORCO,
      };
    });

    res.json({
      diagnosticoId: diagnostico.id,
      createdAt: diagnostico.createdAt,
      dimensoes,
    });
  } catch (error) {
    console.error("Erro ao montar o plano de ação:", error);
    res.status(500).json({ error: "No fue posible armar el plan de acción" });
  }
});

// Rota temporária para testar a conexão com o Gemini
router.get("/teste-ia", requireAuth, async (_req, res) => {
  try {
    const resposta = await testarGemini();

    res.json({
      message: "Conexión con Gemini realizada correctamente",
      resposta,
    });
  } catch (error) {
    console.error("Erro ao testar Gemini:", error);

    res.status(500).json({
      error: "No fue posible conectarse con Gemini",
    });
  }
});


// gera plano de ação personalizado com ia a partir do ultimo diagnostico
router.post("/ia", requireAuth, async (_req, res) => {
  try {
    // busca a empresa que ta fazendo a solicitação
    const empresa = await prisma.empresa.findUnique({
      where: { id: res.locals.userId },
      select: {
        nomeEmpresa: true,
        tamanho: true,
        numFuncionarios: true,
      },
    });

    if (!empresa) {
      res.status(404).json({
        error: "Empresa no encontrada",
      });
      return;
    }

    // busca o diagnóstico mais recente da empresa
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      include: {
        respostas: {
          include: {
            pergunta: true,
          },
        },
      },
    });

    if (!diagnostico) {
      res.status(404).json({
        error: "Realiza el diagnóstico antes de generar el plan con IA",
      });
      return;
    }

    // calcula os resultados com as regras já existentes
    const resultado = calcularResultado(
      diagnostico.respostas.map((r) => ({
        valor: r.valor,
        dimensao: r.pergunta.dimensao,
      })),
    );

    // organiza os dados que vao ser enviados ao gemini
    const dados = {
      empresa: {
        nomeEmpresa: empresa.nomeEmpresa,
        tamanho: empresa.tamanho,
        numFuncionarios: empresa.numFuncionarios,
      },
      diagnostico: {
        pontuacao: resultado.pontuacao,
        nivel: resultado.nivel,
        dimensoes: resultado.dimensoes,
        respostas: diagnostico.respostas.map((r) => ({
          dimensao: r.pergunta.dimensao,
          pergunta: r.pergunta.texto,
          valor: r.valor,
        })),
      },
    };

    // solicita ao gemini um plano personalizado
    const planoGerado = await gerarPlanoIA(dados);

    // 6. Devolve o resultado ao frontend
    res.json({
      diagnosticoId: diagnostico.id,
      plano: planoGerado,
    });
  } catch (error) {
    console.error("Erro ao gerar plano com IA:", error);

    res.status(500).json({
      error: "No fue posible generar el plan de acción con IA",
    });
  }
});

export default router;