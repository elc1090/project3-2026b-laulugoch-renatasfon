import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const TOTAL_PERGUNTAS = 5;

router.get("/", requireAuth, async (_req, res) => {
  try {
    const empresaId = res.locals.userId as number;

    const progresso = await prisma.progressoAcademia.findUnique({
      where: { empresaId },
    });

    return res.json({
      concluido: progresso !== null,
      melhorPontuacao: progresso?.melhorPontuacao ?? null,
      concluidoEm: progresso?.concluidoEm ?? null,
      insignia: progresso ? "Explorador ODS" : null,
    });
  } catch (error) {
    console.error("Erro ao consultar progresso da Academia ODS:", error);
    return res.status(500).json({
      error: "No fue posible consultar el progreso de Academia ODS.",
    });
  }
});

router.post("/concluir", requireAuth, async (req, res) => {
  try {
    const empresaId = res.locals.userId as number;
    const { pontuacao } = req.body;

    if (
      !Number.isInteger(pontuacao) ||
      pontuacao < 0 ||
      pontuacao > TOTAL_PERGUNTAS
    ) {
      return res.status(400).json({
        error: "La puntuación debe estar entre 0 y 5.",
      });
    }

    const progressoAnterior = await prisma.progressoAcademia.findUnique({
      where: { empresaId },
    });

    const progresso = await prisma.progressoAcademia.upsert({
      where: { empresaId },
      create: {
        empresaId,
        melhorPontuacao: pontuacao,
      },
      update: {
        melhorPontuacao: Math.max(
          pontuacao,
          progressoAnterior?.melhorPontuacao ?? 0
        ),
      },
    });

    return res.json({
      message: "¡Felicitaciones! Has obtenido la insignia Explorador ODS.",
      concluido: true,
      melhorPontuacao: progresso.melhorPontuacao,
      concluidoEm: progresso.concluidoEm,
      insignia: "Explorador ODS",
    });
  } catch (error) {
    console.error("Erro ao salvar progresso da Academia ODS:", error);
    return res.status(500).json({
      error: "No fue posible guardar el progreso de Academia ODS.",
    });
  }
});

export default router;