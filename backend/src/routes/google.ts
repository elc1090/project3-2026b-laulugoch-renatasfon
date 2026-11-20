import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { randomBytes } from "node:crypto";

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

  res.cookie("google_oauth_state", state, {
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
    prompt: "select_account",
  });

  res.redirect(url);
});


router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.google_oauth_state;

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      !savedState ||
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
      !payload.email_verified
    ) {
      res.status(401).json({
        error: "Cuenta de Google no verificada",
      });
      return;
    }

    res.json({
      message: "Identidad verificada con Google",
      email: payload.email,
    });
  } catch (error) {
    console.error("Erro na autenticação Google:", error);

    res.status(500).json({
      error: "No fue posible completar la autenticación con Google",
    });
  }
});

export default router;