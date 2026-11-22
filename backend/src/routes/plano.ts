
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calcularResultado, LIMITE_PLANO } from "../lib/diagnostico.js";
import { CATALOGO, REFORCO } from "../lib/plano.js";
import { testarGemini, gerarPlanoIA } from "../lib/gemini.js";

const router = Router();

// PLANO TRADICIONAL
router.get("/", requireAuth, async (_req, res) => {
  try {
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      include: {
        respostas: {
          include: { pergunta: true },
        },
      },
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
      }))
    );

    const dimensoes = resultado.dimensoes.map(
      ({ dimensao, pontuacao }) => {
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
      }
    );

    res.json({
      diagnosticoId: diagnostico.id,
      createdAt: diagnostico.createdAt,
      dimensoes,
    });
  } catch (error) {
    console.error("Erro ao montar o plano:", error);

    res.status(500).json({
      error: "No fue posible armar el plan de acción",
    });
  }
});

// TESTE DE CONEXÃO COM GEMINI
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

// CONSULTAR PLANO DE IA DO ÚLTIMO DIAGNÓSTICO
router.get("/ia", requireAuth, async (_req, res) => {
  try {
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        planoIA: true,
      },
    });

    if (!diagnostico) {
      res.status(404).json({
        error: "Realiza el diagnóstico antes de consultar tu plan",
      });
      return;
    }

    if (!diagnostico.planoIA) {
      res.status(404).json({
        error: "Todavía no tienes un plan generado con IA",
      });
      return;
    }

    res.json({
      diagnosticoId: diagnostico.id,
      planoId: diagnostico.planoIA.id,
      plano: {
        recomendacoes: diagnostico.planoIA.recomendacoes,
      },
      createdAt: diagnostico.planoIA.createdAt,
      updatedAt: diagnostico.planoIA.updatedAt,
    });
  } catch (error) {
    console.error("Erro ao consultar plano IA:", error);

    res.status(500).json({
      error: "No fue posible consultar el plan con IA",
    });
  }
});

// HISTÓRICO DE PLANOS GERADOS
router.get("/ia/historico", requireAuth, async (_req, res) => {
  try {
    const planos = await prisma.planoIA.findMany({
      where: {
        diagnostico: {
          empresaId: res.locals.userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        diagnosticoId: true,
        recomendacoes: true,
        createdAt: true,
        updatedAt: true,
        diagnostico: {
          select: {
            createdAt: true,
            pontuacao: true,
          },
        },
      },
    });

    res.json({
      planos: planos.map((plano) => ({
        id: plano.id,
        diagnosticoId: plano.diagnosticoId,
        recomendacoes: plano.recomendacoes,
        createdAt: plano.createdAt,
        updatedAt: plano.updatedAt,
        diagnostico: plano.diagnostico,
      })),
    });
  } catch (error) {
    console.error("Erro ao consultar histórico:", error);

    res.status(500).json({
      error: "No fue posible consultar el historial de planes",
    });
  }
});

// GERAR OU REGENERAR PLANO COM IA
router.post("/ia", requireAuth, async (_req, res) => {
  try {
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

    const diagnostico = await prisma.diagnostico.findFirst({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      include: {
        respostas: {
          include: { pergunta: true },
        },
      },
    });

    if (!diagnostico) {
      res.status(404).json({
        error: "Realiza el diagnóstico antes de generar el plan con IA",
      });
      return;
    }


    const planoExistente = await prisma.planoIA.findUnique({
  where: {
    diagnosticoId: diagnostico.id,
  },
    });

    if (planoExistente) {
      return res.json({
        diagnosticoId: diagnostico.id,
        planoId: planoExistente.id,
        plano: {
           recomendacoes: planoExistente.recomendacoes,
        },
        createdAt: planoExistente.createdAt,
        updatedAt: planoExistente.updatedAt,
      });
    }

    const resultado = calcularResultado(
      diagnostico.respostas.map((r) => ({
        valor: r.valor,
        dimensao: r.pergunta.dimensao,
      }))
    );

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

    // Gera recomendações usando Gemini
    const planoGerado = await gerarPlanoIA(dados);

    // Salva no PostgreSQL.
    // Se já existir, atualiza o plano do diagnóstico.
    const planoSalvo = await prisma.planoIA.upsert({
      where: {
        diagnosticoId: diagnostico.id,
      },
      create: {
        diagnosticoId: diagnostico.id,
        recomendacoes: planoGerado.recomendacoes,
      },
      update: {
        recomendacoes: planoGerado.recomendacoes,
      },
    });

    res.json({
      diagnosticoId: diagnostico.id,
      planoId: planoSalvo.id,
      plano: {
        recomendacoes: planoSalvo.recomendacoes,
      },
      createdAt: planoSalvo.createdAt,
      updatedAt: planoSalvo.updatedAt,
    });
  } catch (error) {
    console.error("Erro ao gerar e salvar plano IA:", error);

    res.status(500).json({
      error: "No fue posible generar y guardar el plan con IA",
    });
  }
});

export default router;
