import { prisma } from "@/lib/prisma";

function getPool(): string[] {
  const raw = process.env.LEAD_ASSIGN_USER_IDS?.trim() || "";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

export async function nextAssignee(): Promise<string | null> {
  const pool = getPool();
  if (pool.length === 0) return null;
  // Use Kv key "lead_rr_index"
  const key = "lead_rr_index";
  const rec = await prisma.kv.findUnique({ where: { key } });
  const idx = rec ? (parseInt(rec.value || "0", 10) || 0) : 0;
  const chosen = pool[idx % pool.length];
  const next = ((idx + 1) % pool.length).toString();
  if (rec) {
    await prisma.kv.update({ where: { key }, data: { value: next } });
  } else {
    await prisma.kv.create({ data: { key, value: next } });
  }
  return chosen;
}
