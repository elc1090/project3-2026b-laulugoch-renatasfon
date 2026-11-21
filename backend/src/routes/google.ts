import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";

const router = Router();

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const callbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3000/auth/google/callback";

if (!clientId || !clientSecret) {
  throw new Error("Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env");
}

const google = new OAuth2Client(
  clientId,
  clientSecret,
  callbackUrl
);

router.get("/google", (_req, res) => {
  const state = randomBytes(32).toString("hex");
  const nonce = randomBytes(32).toString("hex");

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    path: "/auth",
  });

  res.cookie("google_oauth_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    path: "/auth",
  });

  const url = google.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
    nonce,
    prompt: "select_account",
  });

  res.redirect(url);
});


router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.google_oauth_state;
    const savedNonce = req.cookies?.google_oauth_nonce;

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      typeof savedState !== "string" ||
      typeof savedNonce !== "string" ||
      state !== savedState
    ) {
      res.status(400).json({
        error: "Solicitud de autenticación inválida",
      });
      return;
    }

    res.clearCookie("google_oauth_state", {
      path: "/auth",
    });

    res.clearCookie("google_oauth_nonce", {
      path: "/auth",
    });

    const { tokens } = await google.getToken(code);

    if (!tokens.id_token) {
      res.status(401).json({
        error: "No fue posible verificar la identidad",
      });
      return;
    }

    const ticket = await google.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();


    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      !payload.email_verified ||
      payload.nonce !== savedNonce
    ) {
      res.status(401).json({
        error: "Cuenta de Google no verificada",
      });
      return;
    }

    const empresaGoogle = await prisma.empresa.findUnique({
      where: { googleSub: payload.sub },
    });

    if (empresaGoogle) {
      res.json({
        message: "Cuenta de Google vinculada a una empresa",
        status: "GOOGLE_EXISTENTE",
      });
      return;
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    const empresaEmail = await prisma.empresa.findUnique({
      where: { email: normalizedEmail },
    });

    if (empresaEmail) {
      res.status(409).json({
        error:
          "Este correo electrónico ya está registrado. Inicia sesión con tu contraseña.",
      });
      return;
    }


    const cadastroToken = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(cadastroToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.cadastroGooglePendente.create({
      data: {
        tokenHash,
        googleSub: payload.sub,
        email: normalizedEmail,
        expiresAt,
      },
    });

    res.json({
      message: "Cuenta de Google verificada. Es necesario completar el registro.",
      status: "REGISTRO_PENDIENTE",
      cadastroToken,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Erro na autenticação Google:", error);

    res.status(500).json({
      error: "No fue posible completar la autenticación con Google",
    });
  }
});


router.post("/google/complete-registration", async (req, res) => {
  try {
    const { cadastroToken, nomeEmpresa, tamanho, numFuncionarios } =
      req.body ?? {};

    if (
      typeof cadastroToken !== "string" ||
      typeof nomeEmpresa !== "string" ||
      typeof tamanho !== "string" ||
      typeof numFuncionarios !== "number"
    ) {
      res.status(400).json({ error: "Datos de registro inválidos" });
      return;
    }

    const normalizedNome = nomeEmpresa.trim();

    if (normalizedNome.length === 0 || normalizedNome.length > 150) {
      res.status(400).json({
        error: "El nombre de la empresa debe tener entre 1 y 150 caracteres",
      });
      return;
    }

    const tamanos = ["MICRO", "PEQUENA", "MEDIA"] as const;

    if (!(tamanos as readonly string[]).includes(tamanho)) {
      res.status(400).json({
        error: "Selecciona el tamaño de la empresa",
      });
      return;
    }

    if (
      !Number.isInteger(numFuncionarios) ||
      numFuncionarios < 1 ||
      numFuncionarios > 100000
    ) {
      res.status(400).json({
        error: "Ingresa una cantidad válida de trabajadores",
      });
      return;
    }

    const tokenHash = createHash("sha256")
      .update(cadastroToken)
      .digest("hex");

    const cadastro = await prisma.cadastroGooglePendente.findUnique({
      where: { tokenHash },
    });

    if (!cadastro || cadastro.expiresAt <= new Date()) {
      res.status(401).json({
        error: "El registro expiró. Vuelve a iniciar sesión con Google.",
      });
      return;
    }

    const empresaExistente = await prisma.empresa.findFirst({
      where: {
        OR: [
          { email: cadastro.email },
          { googleSub: cadastro.googleSub },
        ],
      },
    });

    if (empresaExistente) {
      res.status(409).json({
        error: "Ya existe una cuenta asociada a este correo o Google.",
      });
      return;
    }

    const empresa = await prisma.$transaction(async (tx) => {
      const novaEmpresa = await tx.empresa.create({
        data: {
          nomeEmpresa: normalizedNome,
          email: cadastro.email,
          googleSub: cadastro.googleSub,
          tamanho: tamanho as "MICRO" | "PEQUENA" | "MEDIA",
          numFuncionarios,
        },
      });

      await tx.cadastroGooglePendente.delete({
        where: { id: cadastro.id },
      });

      return novaEmpresa;
    });

    res.status(201).json({
      message: "Cuenta creada con éxito",
      user: {
        id: empresa.id,
        nomeEmpresa: empresa.nomeEmpresa,
        email: empresa.email,
        createdAt: empresa.createdAt,
        tamanho: empresa.tamanho,
        numFuncionarios: empresa.numFuncionarios,
      },
      token: signToken(empresa.id),
    });
  } catch (error) {
    console.error("Erro ao concluir cadastro Google:", error);
    res.status(500).json({
      error: "No fue posible completar el registro",
    });
  }
});

export default router;