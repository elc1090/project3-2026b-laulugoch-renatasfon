
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Falta el token de autenticación" });
    return;
  }

  const token = header.slice(7);
  const userId = verifyToken(token);

  if (userId === null) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }

  res.locals.userId = userId;
  next();
}