import express from "express";
import cors from "cors";
import "dotenv/config";

import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});