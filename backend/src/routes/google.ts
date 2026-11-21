
import { Router, type Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";

const router = Router();

const frontendUrl =
  process.env.FRONTEND_URL || "http://localhost:5173";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const callbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3000/auth/google/callback";

if (!clientId || !clientSecret) {
  throw new Error(
    "Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no ambiente"
  );
}

const google = new OAuth2Client(
  clientId,
  clientSecret,
  callbackUrl
);

// Gera um código temporário e armazena somente seu hash.
function criarCodigoTemporario() {
  const codigo = randomBytes(32).toString("hex");

  const codeHash = createHash("sha256")
    .update(codigo)
    .digest("hex");

  return { codigo, codeHash };
}

// Redireciona para o frontend com o código temporário.
function redirecionarFrontend(
  res: Response,
  codigo: string
) {
  const url = new URL("/auth/google/retorno", frontendUrl);
  url.searchParams.set("code", codigo);

  res.redirect(url.toString());
}

// Redireciona para o frontend com uma mensagem de erro.
function redirecionarErroFrontend(
  res: Response,
  mensagem: string
) {
  const url = new URL("/", frontendUrl);
  url.searchParams.set("google_error", mensagem);

  res.redirect(url.toString());
}

// Inicia a autenticação com Google.
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

// Recebe o retorno do Google.
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
      redirecionarErroFrontend(
        res,
        "Solicitud de autenticación inválida. Intenta nuevamente."
      );
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
      redirecionarErroFrontend(
        res,
        "No fue posible verificar la identidad."
      );
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
      redirecionarErroFrontend(
        res,
        "Cuenta de Google no verificada."
      );
      return;
    }

    // Verifica se já existe uma empresa vinculada ao Google.
    const empresaGoogle = await prisma.empresa.findUnique({
      where: { googleSub: payload.sub },
    });

    if (empresaGoogle) {
      const { codigo, codeHash } = criarCodigoTemporario();

      await prisma.googleAuthCode.create({
        data: {
          codeHash,
          empresaId: empresaGoogle.id,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      redirecionarFrontend(res, codigo);
      return;
    }

    const normalizedEmail = payload.email
      .trim()
      .toLowerCase();

    // Impede vinculação automática com uma conta tradicional.
    const empresaEmail = await prisma.empresa.findUnique({
      where: { email: normalizedEmail },
    });

    if (empresaEmail) {
      redirecionarErroFrontend(
        res,
        "Este correo electrónico ya está registrado. Inicia sesión con tu contraseña."
      );
      return;
    }

    // Cria um cadastro pendente para o primeiro acesso.
    const cadastroToken = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(cadastroToken)
      .digest("hex");

    const cadastro = await prisma.cadastroGooglePendente.create({
      data: {
        tokenHash,
        googleSub: payload.sub,
        email: normalizedEmail,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const { codigo, codeHash } = criarCodigoTemporario();

    await prisma.googleAuthCode.create({
      data: {
        codeHash,
        cadastroPendenteId: cadastro.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    redirecionarFrontend(res, codigo);
  } catch (error) {
    console.error("Erro na autenticação Google:", error);

    if (!res.headersSent) {
      redirecionarErroFrontend(
        res,
        "No fue posible completar la autenticación con Google."
      );
    }
  }
});

// Troca o código temporário pelos dados da autenticação.
router.post("/google/exchange", async (req, res) => {
  try {
    const { code } = req.body ?? {};

    if (
      typeof code !== "string" ||
      !/^[a-f0-9]{64}$/.test(code)
    ) {
      res.status(400).json({
        error: "Código de autenticación inválido",
      });
      return;
    }

    const codeHash = createHash("sha256")
      .update(code)
      .digest("hex");

    // Consome o código uma única vez.
    let authCode;

    try {
      authCode = await prisma.googleAuthCode.delete({
        where: { codeHash },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(401).json({
          error: "Código expirado o ya utilizado",
        });
        return;
      }

      throw error;
    }

    if (authCode.expiresAt <= new Date()) {
      res.status(401).json({
        error: "Código expirado o ya utilizado",
      });
      return;
    }

    // Empresa que já possui conta Google.
    if (authCode.empresaId !== null) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: authCode.empresaId },
      });

      if (!empresa) {
        res.status(404).json({
          error: "Empresa no encontrada",
        });
        return;
      }

      res.json({
        status: "GOOGLE_EXISTENTE",
        token: signToken(empresa.id),
        user: {
          id: empresa.id,
          nomeEmpresa: empresa.nomeEmpresa,
          email: empresa.email,
          createdAt: empresa.createdAt,
          tamanho: empresa.tamanho,
          numFuncionarios: empresa.numFuncionarios,
        },
      });
      return;
    }

    // Primeiro acesso: fornece o token do cadastro pendente.
    if (authCode.cadastroPendenteId !== null) {
      const novoCadastroToken = randomBytes(32).toString("hex");

      const novoTokenHash = createHash("sha256")
        .update(novoCadastroToken)
        .digest("hex");

      const cadastro = await prisma.cadastroGooglePendente.updateMany({
        where: {
          id: authCode.cadastroPendenteId,
          expiresAt: { gt: new Date() },
        },
        data: {
          tokenHash: novoTokenHash,
        },
      });

      if (cadastro.count !== 1) {
        res.status(401).json({
          error: "Registro expirado o no encontrado",
        });
        return;
      }

      const cadastroAtualizado =
        await prisma.cadastroGooglePendente.findUnique({
          where: { tokenHash: novoTokenHash },
        });

      if (!cadastroAtualizado) {
        res.status(401).json({
          error: "Registro no encontrado",
        });
        return;
      }

      res.json({
        status: "REGISTRO_PENDIENTE",
        email: cadastroAtualizado.email,
        cadastroToken: novoCadastroToken,
      });
      return;
    }

    res.status(400).json({
      error: "Estado de autenticación inválido",
    });
  } catch (error) {
    console.error("Erro na troca do código Google:", error);

    res.status(500).json({
      error: "No fue posible completar la autenticación",
    });
  }
});

// Conclui o cadastro de uma nova empresa autenticada pelo Google.
router.post("/google/complete-registration", async (req, res) => {
  try {
    const {
      cadastroToken,
      nomeEmpresa,
      tamanho,
      numFuncionarios,
    } = req.body ?? {};

    if (
      typeof cadastroToken !== "string" ||
      typeof nomeEmpresa !== "string" ||
      typeof tamanho !== "string" ||
      typeof numFuncionarios !== "number"
    ) {
      res.status(400).json({
        error: "Datos de registro inválidos",
      });
      return;
    }

    if (!/^[a-f0-9]{64}$/.test(cadastroToken)) {
      res.status(400).json({
        error: "Token de registro inválido",
      });
      return;
    }

    const normalizedNome = nomeEmpresa.trim();

    if (
      normalizedNome.length === 0 ||
      normalizedNome.length > 150
    ) {
      res.status(400).json({
        error:
          "El nombre de la empresa debe tener entre 1 y 150 caracteres",
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
        error:
          "El registro expiró. Vuelve a iniciar sesión con Google.",
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
        error:
          "Ya existe una cuenta asociada a este correo o Google.",
      });
      return;
    }

    // Consome o cadastro pendente e cria a empresa na mesma transação.
    const empresa = await prisma.$transaction(async (tx) => {
      const consumido = await tx.cadastroGooglePendente.deleteMany({
        where: {
          id: cadastro.id,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (consumido.count !== 1) {
        throw new Error("REGISTRO_EXPIRADO");
      }

      return tx.empresa.create({
        data: {
          nomeEmpresa: normalizedNome,
          email: cadastro.email,
          googleSub: cadastro.googleSub,
          tamanho: tamanho as "MICRO" | "PEQUENA" | "MEDIA",
          numFuncionarios,
        },
      });
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
    if (
      error instanceof Error &&
      error.message === "REGISTRO_EXPIRADO"
    ) {
      res.status(401).json({
        error:
          "El registro expiró o ya fue utilizado. Vuelve a iniciar sesión con Google.",
      });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        error:
          "Ya existe una cuenta asociada a este correo o Google.",
      });
      return;
    }

    console.error("Erro ao concluir cadastro Google:", error);

    res.status(500).json({
      error: "No fue posible completar el registro",
    });
  }
});

export default router;
