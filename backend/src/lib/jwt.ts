import "dotenv/config";
import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não está definido no .env");
  }

  return secret;
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, getSecret());

    if (typeof payload === "object" && typeof payload.userId === "number") {
      return payload.userId;
    }
    
    return null;
  } catch {
    return null;
  }
}