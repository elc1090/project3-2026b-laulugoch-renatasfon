import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calcularResultado, LIMITE_PLANO } from "../lib/diagnostico.js";
import { CATALOGO, REFORCO } from "../lib/plano.js";

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

export default router;