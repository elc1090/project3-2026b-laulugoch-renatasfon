import { Router } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
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

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({ error: "Este e-mail já está cadastrado" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    res.status(201).json({
      message: "Conta criada com sucesso",
      user,
      token: signToken(user.id),
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

    console.error("Erro ao cadastrar usuário:", error);
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

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordOk = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordOk) {
      res.status(401).json({ error: "E-mail ou senha incorretos" });
      return;
    }

    res.json({
      message: "Login realizado com sucesso",
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token: signToken(user.id),
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Não foi possível fazer login" });
  }
});

router.get("/me", requireAuth, async (_req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: res.locals.userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Não foi possível buscar o usuário" });
  }
});

export default router;