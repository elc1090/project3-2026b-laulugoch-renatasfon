import express from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import passport from "passport";

import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.js";
import perguntasRouter from "./routes/perguntas.js";
import diagnosticosRouter from "./routes/diagnosticos.js";
import planoRouter from "./routes/plano.js";

const app = express();

app.use(cors());
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("Defina SESSION_SECRET no arquivo .env");
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/perguntas", perguntasRouter);
app.use("/diagnosticos", diagnosticosRouter);
app.use("/plano", planoRouter);

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

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});