import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminExists = await prisma.user.findUnique({ where: { email: "admin@axi.com" } });
  if (!adminExists) {
    const hashed = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: "admin@axi.com",
        password: hashed,
        name: "Admin User",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        status: "active",
        kycStatus: "verified",
        balance: 0,
        equity: 0,
        margin: 0,
        freeMargin: 0,
        marginLevel: 0,
        totalProfit: 0,
        totalLoss: 0,
        country: "US",
        language: "en",
        currency: "USD",
        accountType: "standard",
        platform: "mt5",
      },
    });
    console.log("✅ Admin user created: admin@axi.com / admin123");
  }

  // Create demo user
  const demoExists = await prisma.user.findUnique({ where: { email: "demo@axi.com" } });
  if (!demoExists) {
    const hashed = await bcrypt.hash("demo123", 12);
    await prisma.user.create({
      data: {
        email: "demo@axi.com",
        password: hashed,
        name: "Demo Trader",
        firstName: "Demo",
        lastName: "Trader",
        role: "user",
        status: "active",
        kycStatus: "verified",
        balance: 10000,
        equity: 10250,
        margin: 500,
        freeMargin: 9750,
        marginLevel: 2050,
        totalProfit: 1250,
        totalLoss: 0,
        country: "US",
        language: "en",
        currency: "USD",
        accountType: "standard",
        platform: "mt5",
        phone: "+1234567890",
      },
    });
    console.log("✅ Demo user created: demo@axi.com / demo123");
  }

  console.log("🌱 Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
