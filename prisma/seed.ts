// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data for clean seed
  await prisma.opportunity.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: "PennForce" }
  });

  // Create admin user with password
  const adminPass = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@pennjets.com",
      name: "PennForce Admin",
      role: "admin",
      organizationId: org.id,
      passwordHash: adminPass,
    },
  });

  const joe = await prisma.user.create({
    data: {
      email: "joe@pennjets.com",
      name: "Joseph Pennella",
      organizationId: org.id,
    },
  });

  const klm = await prisma.account.create({
    data: {
      name: "KLM Aviation",
      type: "OPERATOR",
      ownerId: joe.id,
      phone: "+1-973-868-8425",
    },
  });

  const owner = await prisma.account.create({
    data: {
      name: "Samike Corp.",
      type: "OWNER"
    },
  });

  const hawker = await prisma.aircraft.create({
    data: {
      make: "Beechcraft",
      model: "400XP",
      year: 2004,
      serialNumber: "RK-123",
      tailNumber: "N400HH",
      status: "ACTIVE",
      ownerAccountId: owner.id,
      operatorAccountId: klm.id,
      locationIcao: "KFXE",
      totalTimeHrs: 4600,
      enginesJson: JSON.stringify({
        left: { type: "JT15D-5", tso: 1000 },
        right: { type: "JT15D-5", tso: 1000 }
      }),
      avionicsJson: JSON.stringify({
        fms: "Collins UNS-1",
        transponder: "Mode S"
      }),
    },
  });

  await prisma.opportunity.create({
    data: {
      name: "Hawker 400XP Share (25%)",
      stage: "PROPOSAL",
      amount: 350000,
      accountId: owner.id,
      aircraftId: hawker.id,
      ownerId: joe.id,
      source: "Referral",
    },
  });

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
