import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { enviarFeedbackPlanilha } from "../lib/googleSheets.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
    try {
        const { avaliacao, comentario } = req.body ?? {};

        if (
            !Number.isInteger(avaliacao) ||
            avaliacao < 1 ||
            avaliacao > 5
        ) {
            res.status(400).json({
                error: "La calificación debe ser un número entre 1 y 5",
            });
            return;
        }

        if (
            comentario !== undefined &&
            comentario !== null &&
            typeof comentario !== "string"
        ) {
            res.status(400).json({
                error: "El comentario debe ser un texto",
            });
            return;
        }

        const comentarioTratado =
            typeof comentario === "string" ? comentario.trim() : "";

        if (comentarioTratado.length > 1000) {
            res.status(400).json({
                error: "El comentario no puede superar los 1000 caracteres",
            });
            return;
        }

        const feedback = await prisma.feedback.create({
            data: {
                empresaId: res.locals.userId,
                avaliacao,
                comentario: comentarioTratado || null,
            },
            include: {
                empresa: {
                    select: {
                        nomeEmpresa: true,
                    },
                },
            },
        });

        try {
            await enviarFeedbackPlanilha({
                empresa: feedback.empresa.nomeEmpresa,
                avaliacao: feedback.avaliacao,
                comentario: feedback.comentario || "",
            });
        } catch (erroPlanilha) {
            console.error("Erro ao enviar feedback para Google Sheets:", erroPlanilha);
        }

        res.status(201).json({
            message: "¡Gracias por compartir tu opinión!",
            feedbackId: feedback.id,
        });
    } catch (error) {
        console.error("Erro ao salvar feedback:", error);

        res.status(500).json({
            error: "No fue posible guardar tu opinión. Inténtalo nuevamente.",
        });
    }
});

export default router;