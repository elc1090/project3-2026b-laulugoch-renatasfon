
import { Router } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  try {
    const { nomeEmpresa, email, password } = req.body ?? {};

    if (
      typeof nomeEmpresa !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({ error: "Todos os campos são obrigatórios" });
      return;
    }

    const normalizedNome = nomeEmpresa.trim();

    if (normalizedNome.length === 0 || normalizedNome.length > 150) {
      res.status(400).json({
        error: "O nome da empresa deve ter entre 1 e 150 caracteres",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length === 0 ||
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      res.status(400).json({ error: "Informe um e-mail válido" });
      return;
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      res.status(400).json({
        error: "A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes",
      });
      return;
    }

    const existingEmpresa = await prisma.empresa.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmpresa) {
      res.status(409).json({ error: "Este e-mail já está cadastrado" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const empresa = await prisma.empresa.create({
      data: {
        nomeEmpresa: normalizedNome,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        nomeEmpresa: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Conta criada com sucesso",
      user: empresa,
      token: signToken(empresa.id),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Este e-mail já está cadastrado" });
      return;
    }

    console.error("Erro ao cadastrar empresa:", error);
    res.status(500).json({ error: "Não foi possível criar a conta" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length === 0 ||
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail) ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({ error: "Dados de login inválidos" });
      return;
    }

    const empresa = await prisma.empresa.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordOk = empresa
      ? await bcrypt.compare(password, empresa.passwordHash)
      : false;

    if (!empresa || !passwordOk) {
      res.status(401).json({ error: "E-mail ou senha incorretos" });
      return;
    }

    res.json({
      message: "Login realizado com sucesso",
      user: {
        id: empresa.id,
        nomeEmpresa: empresa.nomeEmpresa,
        email: empresa.email,
        createdAt: empresa.createdAt,
      },
      token: signToken(empresa.id),
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Não foi possível fazer login" });
  }
});

router.get("/me", requireAuth, async (_req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: res.locals.userId },
      select: {
        id: true,
        nomeEmpresa: true,
        email: true,
        createdAt: true,
      },
    });

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res.json({ user: empresa });
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ error: "Não foi possível buscar a empresa" });
  }
});

export default router;
