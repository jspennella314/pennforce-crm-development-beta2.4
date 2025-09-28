// app/api/_selfcheck/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: any = { ok: true, errors: [] as string[] };

  // ENV
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };
  if (!env.DATABASE_URL) checks.errors.push("Missing DATABASE_URL");
  if (!env.NEXTAUTH_URL) checks.errors.push("Missing NEXTAUTH_URL");
  if (!env.NEXTAUTH_SECRET) checks.errors.push("Missing NEXTAUTH_SECRET");

  // DB + Prisma
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "connected";
  } catch (e: any) {
    checks.errors.push(`DB connection failed: ${e?.message ?? e}`);
  }

  // Seeded admin
  try {
    const admin = await prisma.user.findUnique({ where: { email: "admin@pennjets.com" } });
    checks.adminUser = !!admin ? "present" : "missing";
    if (!admin) checks.errors.push("Seed admin user not found (admin@pennjets.com)");
  } catch (e: any) {
    checks.errors.push(`Admin check failed: ${e?.message ?? e}`);
  }

  // Org scoping sanity (at least 1 org and 1 model row with orgId)
  try {
    const orgs = await prisma.organization.count();
    checks.orgs = orgs;
    const anyScoped =
      (await prisma.account.count()) +
      (await prisma.contact.count()) +
      (await prisma.aircraft.count()) +
      (await prisma.opportunity.count());
    checks.anyScopedRows = anyScoped;
  } catch (e: any) {
    checks.errors.push(`Scope check failed: ${e?.message ?? e}`);
  }

  checks.ok = checks.errors.length === 0;
  return NextResponse.json({ env, ...checks });
}