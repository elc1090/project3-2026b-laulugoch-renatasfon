
import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { OPCOES_RESPOSTA } from "../lib/diagnostico.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  try {
    const perguntas = await prisma.pergunta.findMany({
      where: {
        ativa: true,
      },
      orderBy: {
        ordem: "asc",
      },
      select: {
        id: true,
        dimensao: true,
        ordem: true,
        texto: true,
      },
    });

    res.json({
      perguntas,
      opcoes: OPCOES_RESPOSTA,
    });
  } catch (error) {
    console.error("Erro ao buscar perguntas:", error);

    res.status(500).json({
      error: "Não foi possível buscar as perguntas",
    });
  }
});

export default router;