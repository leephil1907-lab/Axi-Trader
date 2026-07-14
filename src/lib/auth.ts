import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "axi-trader-default-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, status: true, balance: true, equity: true,
      margin: true, freeMargin: true, kycStatus: true,
    },
  });

  return user;
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  return localStorage.getItem("axi_token");
}

export function setAuthToken(token: string): void {
  if (typeof document === "undefined") return;
  localStorage.setItem("axi_token", token);
}

export function removeAuthToken(): void {
  if (typeof document === "undefined") return;
  localStorage.removeItem("axi_token");
}
