// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Prisma client:', typeof prisma);
console.log('Prisma organization:', typeof prisma.organization);
console.log('Prisma keys:', Object.keys(prisma).slice(0, 20));

async function test() {
  try {
    const orgs = await prisma.organization.findMany();
    console.log('Organizations:', orgs);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
