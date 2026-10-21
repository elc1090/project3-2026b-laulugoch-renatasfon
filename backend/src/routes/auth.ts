
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
      res.status(400).json({ error: "Todos los campos son obligatorios" });
      return;
    }

    const normalizedNome = nomeEmpresa.trim();

    if (normalizedNome.length === 0 || normalizedNome.length > 150) {
      res.status(400).json({
        error: "El nombre de la empresa debe tener entre 1 y 150 caracteres",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length === 0 ||
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      res.status(400).json({ error: "Ingresa un correo electrónico válido" });
      return;
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres y un máximo de 72 bytes",
      });
      return;
    }

    const existingEmpresa = await prisma.empresa.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmpresa) {
      res.status(409).json({ error: "Este correo electrónico ya está registrado" });
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
      message: "Cuenta creada con éxito",
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
      res.status(409).json({ error: "Este correo electrónico ya está registrado" });
      return;
    }

    console.error("Erro ao cadastrar empresa:", error);
    res.status(500).json({ error: "No fue posible crear la cuenta" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "El correo electrónico y la contraseña son obligatorios" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length === 0 ||
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail) ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({ error: "Datos de inicio de sesión inválidos" });
      return;
    }

    const empresa = await prisma.empresa.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordOk = empresa
      ? await bcrypt.compare(password, empresa.passwordHash)
      : false;

    if (!empresa || !passwordOk) {
      res.status(401).json({ error: "Correo electrónico o contraseña incorrectos" });
      return;
    }

    res.json({
      message: "Inicio de sesión exitoso",
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
    res.status(500).json({ error: "No fue posible iniciar sesión" });
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
      res.status(404).json({ error: "Empresa no encontrada" });
      return;
    }

    res.json({ user: empresa });
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ error: "No fue posible obtener la empresa" });
  }
});

export default router;
