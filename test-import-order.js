// Test if XLSX interferes with Prisma

console.log('Test 1: Import Prisma first');
const { PrismaClient } = require('./app/generated/prisma');
console.log('PrismaClient loaded:', typeof PrismaClient);

const prisma = new PrismaClient();
console.log('Prisma instance created:', typeof prisma);
console.log('Prisma.organization:', typeof prisma.organization);
console.log('Prisma.organization.findFirst:', typeof prisma.organization.findFirst);

console.log('\nTest 2: Now import XLSX');
const XLSX = require('xlsx');
console.log('XLSX loaded:', typeof XLSX);

console.log('\nTest 3: Check Prisma after XLSX');
console.log('Prisma.organization after XLSX:', typeof prisma.organization);
console.log('Prisma.organization.findFirst after XLSX:', typeof prisma.organization.findFirst);

async function test() {
  try {
    const org = await prisma.organization.findFirst();
    console.log('✅ Found organization:', org?.name || 'none');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
