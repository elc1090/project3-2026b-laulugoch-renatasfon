import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import {
  calcularResultado,
  nivelPorPontuacao,
  VALORES_VALIDOS,
} from "../lib/diagnostico.js";

const router = Router();

router.use(requireAuth);

type DiagnosticoCompleto = {
  id: number;
  createdAt: Date;
  respostas: {
    perguntaId: string;
    valor: number;
    pergunta: { dimensao: string };
  }[];
};

function montarResultado(diagnostico: DiagnosticoCompleto) {
  const resultado = calcularResultado(
    diagnostico.respostas.map((r) => ({
      valor: r.valor,
      dimensao: r.pergunta.dimensao,
    })),
  );

  return {
    id: diagnostico.id,
    createdAt: diagnostico.createdAt,
    ...resultado,
    respostas: diagnostico.respostas.map((r) => ({
      perguntaId: r.perguntaId,
      valor: r.valor,
    })),
  };
}

// cria um diagnóstico e o backend calcula tudo a partir das respostas
router.post("/", async (req, res) => {
  try {
    const { respostas } = req.body ?? {};

    if (!Array.isArray(respostas)) {
      res.status(400).json({ error: "Envie a lista de respostas" });
      return;
    }

    const perguntas = await prisma.pergunta.findMany({
      where: { ativa: true },
    });

    if (respostas.length !== perguntas.length) {
      res.status(400).json({
        error: `Responda todas as ${perguntas.length} perguntas`,
      });
      return;
    }

    const valores = new Map<string, number>();

    for (const item of respostas) {
      const perguntaId = item?.perguntaId;
      const valor = item?.valor;

      if (
        typeof perguntaId !== "string" ||
        !VALORES_VALIDOS.includes(valor)
      ) {
        res.status(400).json({
          error: `Cada resposta precisa de perguntaId e valor ${VALORES_VALIDOS.join(", ")}`,
        });
        return;
      }

      if (valores.has(perguntaId)) {
        res.status(400).json({ error: "Há perguntas respondidas mais de uma vez" });
        return;
      }

      valores.set(perguntaId, valor);
    }

    if (perguntas.some((p) => !valores.has(p.id))) {
      res.status(400).json({ error: "As respostas não correspondem às perguntas" });
      return;
    }

    const resultado = calcularResultado(
      perguntas.map((p) => ({
        valor: valores.get(p.id) as number,
        dimensao: p.dimensao,
      })),
    );

    // empresaId vem do token
    const diagnostico = await prisma.diagnostico.create({
      data: {
        empresaId: res.locals.userId,
        pontosTotais: resultado.pontosTotais,
        pontuacao: resultado.pontuacao,
        respostas: {
          create: perguntas.map((p) => ({
            perguntaId: p.id,
            valor: valores.get(p.id) as number,
          })),
        },
      },
      select: { id: true, createdAt: true },
    });

    res.status(201).json({
      id: diagnostico.id,
      createdAt: diagnostico.createdAt,
      ...resultado,
      respostas: perguntas.map((p) => ({
        perguntaId: p.id,
        valor: valores.get(p.id) as number,
      })),
    });
  } catch (error) {
    console.error("Erro ao criar diagnóstico:", error);
    res.status(500).json({ error: "Não foi possível salvar o diagnóstico" });
  }
});

// histórico da empresa logada (pra comparar avaliações)
router.get("/", async (_req, res) => {
  try {
    const lista = await prisma.diagnostico.findMany({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      select: { id: true, createdAt: true, pontosTotais: true, pontuacao: true },
    });

    res.json({
      diagnosticos: lista.map((d) => ({
        ...d,
        nivel: nivelPorPontuacao(d.pontuacao),
      })),
    });
  } catch (error) {
    console.error("Erro ao listar diagnósticos:", error);
    res.status(500).json({ error: "Não foi possível listar os diagnósticos" });
  }
});

// último diagnóstico
router.get("/ultimo", async (_req, res) => {
  try {
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { empresaId: res.locals.userId },
      orderBy: { id: "desc" },
      include: { respostas: { include: { pergunta: true } } },
    });

    if (!diagnostico) {
      res.status(404).json({ error: "Nenhum diagnóstico realizado ainda" });
      return;
    }

    res.json(montarResultado(diagnostico));
  } catch (error) {
    console.error("Erro ao buscar o último diagnóstico:", error);
    res.status(500).json({ error: "Não foi possível buscar o diagnóstico" });
  }
});

// diagnóstico específico
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Identificador inválido" });
      return;
    }

    const diagnostico = await prisma.diagnostico.findFirst({
      where: { id, empresaId: res.locals.userId },
      include: { respostas: { include: { pergunta: true } } },
    });

    if (!diagnostico) {
      res.status(404).json({ error: "Diagnóstico não encontrado" });
      return;
    }

    res.json(montarResultado(diagnostico));
  } catch (error) {
    console.error("Erro ao buscar diagnóstico:", error);
    res.status(500).json({ error: "Não foi possível buscar o diagnóstico" });
  }
});

export default router;