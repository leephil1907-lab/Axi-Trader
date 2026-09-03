import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role: string };
    if (!decoded.userId || !decoded.role) return null;
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
      name: true, role: true, status: true, balance: true, equity: true,
      margin: true, freeMargin: true, kycStatus: true, currency: true,
      country: true, language: true, accountType: true, platform: true,
      createdAt: true,
    },
  });

  if (!user || user.status !== "active") return null;
  if (user.role !== decoded.role) return null;

  return user;
}
